import React, { useState, useRef } from "react";
import { WebView } from "react-native-webview";
import { ScrollView, Dimensions } from "react-native";

const PDFViewerWebview = ({ base64Data }) => {
  const [webViewHeight, setWebViewHeight] = useState(
    Dimensions.get("window").height,
  );
  const webViewRef = useRef(null);

  // Remove any "data:" prefix if it exists and get just the base64 string
  //   const cleanBase64 = base64Data.replace(/^data:application\/pdf;base64,/, "");
  const cleanBase64 = base64Data
    .replace(/^data:application\/pdf;base64,/, "")
    .replace(/\s/g, "");

  const raw = atob("${cleanBase64}");
  const pdfData = new Uint8Array(raw.length);

  for (let i = 0; i < raw.length; i++) {
    pdfData[i] = raw.charCodeAt(i);
  }

  const loadingTask = pdfjsLib.getDocument({ data: pdfData });

  // Create the HTML content that will display the PDF
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0">
        <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            -webkit-text-size-adjust: none;
          }
          
          html, body {
            width: 100%;
            margin: 0;
            padding: 0;
            background-color: #f5f5f5;
          }
          
          body {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 16px;
          }
          
          #pdf-container {
            width: 100%;
            max-width: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 16px;
          }
          
          .pdf-page {
            width: 100% !important;
            height: auto !important;
            margin: 0;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            background-color: white;
            border-radius: 8px;
            touch-action: manipulation;
          }
        </style>
      </head>
      <body>
        <div id="pdf-container"></div>
        <script>
          pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
          
          async function loadPDF() {
            try {
              const pdfData = atob('${cleanBase64}');
              const loadingTask = pdfjsLib.getDocument({data: pdfData});
              const pdf = await loadingTask.promise;
              const container = document.getElementById('pdf-container');
              const viewportWidth = document.body.clientWidth - 32; // Account for padding
              
              // Get device pixel ratio for better resolution
              const pixelRatio = window.devicePixelRatio || 1;
              
              for(let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                const page = await pdf.getPage(pageNum);
                const originalViewport = page.getViewport({scale: 1});
                
                // Calculate base scale to fit width
                const baseScale = viewportWidth / originalViewport.width;
                
                // Apply higher resolution scale for better quality when zooming
                const qualityScale = baseScale * Math.max(pixelRatio * 2, 2); // minimum 2x for quality
                const viewport = page.getViewport({scale: qualityScale});
                
                const canvas = document.createElement('canvas');
                canvas.className = 'pdf-page';
                const context = canvas.getContext('2d', { alpha: false });
                
                // Set canvas dimensions to the high-resolution size
                canvas.width = viewport.width;
                canvas.height = viewport.height;
                
                // Set display size to the original size
                canvas.style.width = (viewport.width / qualityScale * baseScale) + 'px';
                canvas.style.height = (viewport.height / qualityScale * baseScale) + 'px';
                
                // Enable image smoothing for better quality
                context.imageSmoothingEnabled = true;
                context.imageSmoothingQuality = 'high';
                
                await page.render({
                  canvasContext: context,
                  viewport: viewport,
                  background: 'rgb(255, 255, 255)'
                }).promise;
                
                container.appendChild(canvas);
              }
              
              // Send total height to React Native
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'dimensions',
                height: document.body.scrollHeight
              }));
            } catch (error) {
              console.error('Error loading PDF:', error);
            }
          }
          
          loadPDF();
        </script>
      </body>
    </html>
  `;

  const onMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === "dimensions") {
        setWebViewHeight(data.height);
      }
    } catch (error) {
      console.error("Error parsing WebView message:", error);
    }
  };

  return (
    <ScrollView
      style={{ flex: 1, width: "100%" }}
      contentContainerStyle={{ flexGrow: 1 }}
      maximumZoomScale={4.0}
      minimumZoomScale={1.0}
    >
      <WebView
        ref={webViewRef}
        useWebKit={true}
        source={{ html: htmlContent }}
        style={{
          width: "100%",
          height: webViewHeight,
        }}
        originWhitelist={["*"]}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scrollEnabled={true}
        onMessage={onMessage}
        bounces={true}
        allowsInlineMediaPlayback={true}
        scalesPageToFit={false}
        automaticallyAdjustContentInsets={false}
        showsHorizontalScrollIndicator={true}
        showsVerticalScrollIndicator={true}
      />
    </ScrollView>
  );
};

export default PDFViewerWebview;

export default function CriticalCSS() {
  return (
    <style dangerouslySetInnerHTML={{__html: `
      body {
        margin: 0;
        padding: 0;
        font-family: Inter, system-ui, -apple-system, sans-serif;
        background: hsl(210 20% 98%);
        color: hsl(215 25% 15%);
      }
      
      * {
        box-sizing: border-box;
      }
      
      .min-h-screen {
        min-height: 100vh;
      }
      
      .flex {
        display: flex;
      }
      
      .items-center {
        align-items: center;
      }
      
      .justify-center {
        justify-content: center;
      }
      
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
      
      .animate-spin {
        animation: spin 1s linear infinite;
      }
    `}} />
  );
}

import { baseURL } from "@/baseUrl";
import { createMcpHandler } from "mcp-handler";
import { z } from "zod";

const getAppsSdkCompatibleHtml = async (baseUrl: string, path: string) => {
  const result = await fetch(`${baseUrl}${path}`);
  return await result.text();
};

type ContentWidget = {
  id: string;
  title: string;
  templateUri: string;
  invoking: string;
  invoked: string;
  html: string;
  description: string;
  widgetDomain: string;
};

function widgetMeta(widget: ContentWidget) {
  return {
    "openai/outputTemplate": widget.templateUri,
    "openai/toolInvocation/invoking": widget.invoking,
    "openai/toolInvocation/invoked": widget.invoked,
    "openai/widgetAccessible": false,
    "openai/resultCanProduceWidget": true,
  } as const;
}

const handler = createMcpHandler(async (server) => {
  const html = await getAppsSdkCompatibleHtml(baseURL, "/");

  const contentWidget: ContentWidget = {
    id: "show_content",
    title: "Show Content",
    templateUri: "ui://widget/content-template.html",
    invoking: "Loading content...",
    invoked: "Content loaded",
    html: html,
    description: "Displays the homepage content",
    widgetDomain: baseURL,
  };
  server.registerResource(
    "content-widget",
    contentWidget.templateUri,
    {
      title: contentWidget.title,
      description: contentWidget.description,
      mimeType: "text/html+skybridge",
      _meta: {
        "openai/widgetDescription": contentWidget.description,
        "openai/widgetPrefersBorder": true,
      },
    },
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          mimeType: "text/html+skybridge",
          text: `<html>${contentWidget.html}</html>`,
          _meta: {
            "openai/widgetDescription": contentWidget.description,
            "openai/widgetPrefersBorder": true,
            "openai/widgetDomain": contentWidget.widgetDomain,
          },
        },
      ],
    })
  );

  server.registerTool(
    contentWidget.id,
    {
      title: contentWidget.title,
      description:
        "Fetch and display the homepage content with the name of the user",
      inputSchema: {
        name: z.string().describe("The name of the user to display on the homepage"),
      },
      _meta: widgetMeta(contentWidget),
    },
    async ({ name }) => {
      return {
        content: [
          {
            type: "text",
            text: name,
          },
        ],
        structuredContent: {
          name: name,
          timestamp: new Date().toISOString(),
        },
        _meta: widgetMeta(contentWidget),
      };
    }
  );

  // ====== 新增：可帶參數的 widget（Next.js 頁面直接嵌入） ======
  // 這個不需要 registerResource；直接用 templateUri 指到你的頁面路徑即可。
  server.registerTool(
    "open_hello_widget",
    {
      title: "Open Hello Widget",
      description: "Open a Hello widget page in ChatGPT that greets the user by name",
      inputSchema: {
        name: z.string().describe("Name shown in the widget"),
      },
      // 這裡只宣告能力；真正在 handler 裡動態指定 templateUri
      _meta: {
        "openai/resultCanProduceWidget": true,
      },
    },
    async ({ name }) => {
      const templateUri = `/hello?name=${encodeURIComponent(name)}`;
      return {
        content: [
          {
            type: "tool_result",
            content: { ok: true, message: `Opening widget for ${name}...` },
            metadata: {
              "openai/resultCanProduceWidget": true,
              "openai/templateUri": templateUri,
  
              // 建議加，改善 UX（可選）
              "openai/toolInvocation/invoking": "Opening widget…",
              "openai/toolInvocation/invoked": "Widget opened",
  
              // 建議加，指定你的網域，避免同源判定/載入資源問題
              "openai/widgetDomain": baseURL,
            },
          },
        ],
      };
    }
  );
});

export const GET = handler;
export const POST = handler;

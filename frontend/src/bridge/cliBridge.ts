const BRIDGE_URL = "ws://127.0.0.1:8765";

export type BridgeMessage =
  | { type: "ready" }
  | { type: "output"; data: string }
  | { type: "exit"; code: number }
  | { type: "error"; message: string };

type Handler = (msg: BridgeMessage) => void;

export class CliBridge {
  private ws: WebSocket | null = null;
  private handlers = new Set<Handler>();
  private openPromise: Promise<void> | null = null;

  onMessage(handler: Handler): () => void {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }

  private emit(msg: BridgeMessage) {
    for (const h of this.handlers) h(msg);
  }

  connect(): Promise<void> {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      return Promise.resolve();
    }
    if (this.openPromise) return this.openPromise;

    this.openPromise = new Promise((resolve, reject) => {
      const ws = new WebSocket(BRIDGE_URL);
      this.ws = ws;

      ws.onopen = () => {
        this.openPromise = null;
        resolve();
      };

      ws.onerror = () => {
        this.openPromise = null;
        reject(new Error("Bridge connection failed. Is the bridge running on :8765?"));
      };

      ws.onmessage = (ev) => {
        try {
          this.emit(JSON.parse(String(ev.data)) as BridgeMessage);
        } catch {
          /* ignore */
        }
      };

      ws.onclose = () => {
        this.ws = null;
        this.openPromise = null;
      };
    });

    return this.openPromise;
  }

  send(payload: Record<string, unknown>) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error("Bridge not connected");
    }
    this.ws.send(JSON.stringify(payload));
  }

  start(cols: number, rows: number) {
    this.send({ type: "start", cols, rows });
  }

  input(data: string) {
    this.send({ type: "input", data });
  }

  resize(cols: number, rows: number) {
    this.send({ type: "resize", cols, rows });
  }

  close() {
    this.ws?.close();
    this.ws = null;
  }
}

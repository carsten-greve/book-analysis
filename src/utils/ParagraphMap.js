export class ParagraphMap {
  constructor() {
    this.nodes = new Map();
    this.head = null;
    this.tail = null;
  }

  upsert(id, style, anchorId = null, position = "after") {
    let node = this.nodes.get(id);

    if (!node) {
      node = { id, style, prev: null, next: null };
      this.nodes.set(id, node);
      this._link(node, anchorId, position);
    } else {
      node.style = style;
    }
  }

  delete(id) {
    const node = this.nodes.get(id);
    if (!node) return;

    if (node.prev) node.prev.next = node.next;
    if (node.next) node.next.prev = node.prev;
    if (node === this.head) this.head = node.next;
    if (node === this.tail) this.tail = node.prev;

    this.nodes.delete(id);
  }

  get(id) { return this.nodes.get(id); }

  _link(newNode, anchorId, position) {
    if (!this.head) {
      this.head = this.tail = newNode;
      return;
    }
    const anchor = this.nodes.get(anchorId) || this.tail;
    if (position === "after") {
      newNode.next = anchor.next;
      newNode.prev = anchor;
      if (anchor.next) anchor.next.prev = newNode;
      anchor.next = newNode;
      if (anchor === this.tail) this.tail = newNode;
    }
    // (Add "before" logic similarly if needed)
  }
}

import { Crepe } from "@milkdown/crepe";
import "@milkdown/crepe/theme/common/style.css";
import "@milkdown/crepe/theme/classic.css";

class MarkNoteWysiwygEditor {
  constructor({ root, markdown, onChange }) {
    this.root = root;
    this.markdown = markdown;
    this.onChange = onChange;
    this.crepe = null;
    this.isSyncing = false;
  }

  async mount() {
    this.crepe = new Crepe({
      root: this.root,
      defaultValue: this.markdown,
      features: {
        [Crepe.Feature.ImageBlock]: false,
        [Crepe.Feature.AI]: false,
        [Crepe.Feature.Latex]: false,
        [Crepe.Feature.TopBar]: false
      },
      featureConfigs: {
        [Crepe.Feature.Placeholder]: {
          text: "Start writing..."
        }
      }
    });

    this.crepe.on((listener) => {
      listener.markdownUpdated((_ctx, markdown) => {
        if (this.isSyncing) return;
        this.markdown = markdown;
        this.onChange?.(markdown);
      });
    });

    await this.crepe.create();
  }

  getMarkdown() {
    return this.crepe?.getMarkdown() ?? this.markdown;
  }

  async setMarkdown(markdown) {
    if (markdown === this.markdown) return;
    this.markdown = markdown;
    if (!this.crepe) return;

    this.isSyncing = true;
    await this.crepe.destroy();
    this.root.innerHTML = "";
    this.crepe = null;
    await this.mount();
    this.isSyncing = false;
  }

  focus() {
    this.root.querySelector("[contenteditable='true']")?.focus();
  }

  scrollToHeading(heading) {
    const headings = [...this.root.querySelectorAll("h1, h2, h3")];
    const target = headings.find((node) => node.textContent.trim() === heading.text);
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async destroy() {
    await this.crepe?.destroy();
    this.crepe = null;
  }
}

window.MarkNoteWysiwyg = {
  create: async (options) => {
    const editor = new MarkNoteWysiwygEditor(options);
    await editor.mount();
    return editor;
  }
};

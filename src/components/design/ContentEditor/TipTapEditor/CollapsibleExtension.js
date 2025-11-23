import { Node, mergeAttributes } from "@tiptap/core";

const CollapsibleExtension = Node.create({
  name: "collapsible",

  group: "block",

  content: "block+",

  addAttributes() {
    return {
      open: {
        default: false,
        parseHTML: (element) => element.getAttribute("data-open") === "true",
        renderHTML: (attributes) => {
          return {
            "data-open": attributes.open ? "true" : "false",
          };
        },
      },
      buttonText: {
        default: "Show more details",
        parseHTML: (element) => {
          const button = element.querySelector(".collapsible-button");
          return (
            button?.getAttribute("data-button-text") || "Show more details"
          );
        },
        renderHTML: (attributes) => {
          return {};
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="collapsible"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes, node }) {
    const isOpen = node.attrs.open;
    const buttonText = node.attrs.buttonText || "Show more details";

    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        "data-type": "collapsible",
        "data-open": isOpen ? "true" : "false",
        class: "tiptap-collapsible",
      }),
      [
        "button",
        {
          class: "collapsible-button",
          type: "button",
          "data-button-text": buttonText,
          contenteditable: "false",
        },
        buttonText,
      ],
      [
        "div",
        {
          class: `collapsible-content ${isOpen ? "open" : ""}`,
          style: isOpen ? "" : "display: none;",
        },
        0,
      ],
    ];
  },

  addNodeView() {
    return ({ node, getPos, editor }) => {
      const dom = document.createElement("div");
      dom.setAttribute("data-type", "collapsible");
      dom.className = "tiptap-collapsible";
      dom.setAttribute("data-open", node.attrs.open ? "true" : "false");

      const button = document.createElement("button");
      button.className = "collapsible-button";
      button.type = "button";
      button.setAttribute("contenteditable", "false");
      button.textContent = node.attrs.buttonText || "Show more details";

      const content = document.createElement("div");
      content.className = "collapsible-content";
      if (node.attrs.open) {
        content.classList.add("open");
      } else {
        content.style.display = "none";
      }

      const contentWrapper = document.createElement("div");
      content.appendChild(contentWrapper);

      const handleClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const currentPos = typeof getPos === "function" ? getPos() : null;
        if (currentPos !== null && currentPos !== undefined) {
          const isOpen = node.attrs.open;
          editor.commands.command(({ tr, dispatch }) => {
            const nodePos = currentPos;
            const nodeAtPos = tr.doc.nodeAt(nodePos);
            if (nodeAtPos && nodeAtPos.type.name === this.name) {
              if (dispatch) {
                tr.setNodeMarkup(nodePos, undefined, {
                  ...nodeAtPos.attrs,
                  open: !isOpen,
                });
              }
              return true;
            }
            return false;
          });
        }
      };

      button.addEventListener("click", handleClick);

      dom.appendChild(button);
      dom.appendChild(content);

      return {
        dom,
        contentDOM: contentWrapper,
        update: (updatedNode) => {
          if (updatedNode.type.name !== this.name) {
            return false;
          }

          const newButtonText =
            updatedNode.attrs.buttonText || "Show more details";
          button.textContent = newButtonText;
          button.setAttribute("data-button-text", newButtonText);

          const isOpen = updatedNode.attrs.open;
          dom.setAttribute("data-open", isOpen ? "true" : "false");
          if (isOpen) {
            content.style.display = "";
            content.classList.add("open");
          } else {
            content.style.display = "none";
            content.classList.remove("open");
          }

          return true;
        },
      };
    };
  },

  addCommands() {
    return {
      setCollapsible:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: {
              open: options?.open ?? false,
              buttonText: options?.buttonText || "Show more details",
            },
            content: options?.content || [
              {
                type: "paragraph",
              },
            ],
          });
        },
      toggleCollapsible:
        () =>
        ({ tr, state, dispatch }) => {
          const { selection } = state;
          const { $from } = selection;
          let node = $from.node();
          let pos = $from.pos;

          if (node.type.name !== this.name) {
            for (let i = $from.depth; i > 0; i--) {
              const nodeAtDepth = $from.node(i);
              if (nodeAtDepth.type.name === this.name) {
                node = nodeAtDepth;
                pos = $from.before(i);
                break;
              }
            }
          }

          if (node && node.type.name === this.name) {
            if (dispatch) {
              tr.setNodeMarkup(pos, undefined, {
                ...node.attrs,
                open: !node.attrs.open,
              });
            }
            return true;
          }
          return false;
        },
    };
  },
});

export default CollapsibleExtension;

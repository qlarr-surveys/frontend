import Image from "@tiptap/extension-image";

// Custom Image extension with upload support
const ImageExtension = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      src: {
        default: null,
      },
      alt: {
        default: null,
      },
      title: {
        default: null,
      },
      width: {
        default: null,
        parseHTML: (element) => element.getAttribute("width"),
        renderHTML: (attributes) => {
          if (!attributes.width) {
            return {};
          }
          return {
            width: attributes.width,
          };
        },
      },
      height: {
        default: null,
        parseHTML: (element) => element.getAttribute("height"),
        renderHTML: (attributes) => {
          if (!attributes.height) {
            return {};
          }
          return {
            height: attributes.height,
          };
        },
      },
      // Store the resource filename for internal use
      resourceName: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-resource-name"),
        renderHTML: (attributes) => {
          if (!attributes.resourceName) {
            return {};
          }
          return {
            "data-resource-name": attributes.resourceName,
          };
        },
      },
    };
  },

  addCommands() {
    return {
      ...this.parent?.(),
      setImage:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          });
        },
    };
  },
});

export default ImageExtension;

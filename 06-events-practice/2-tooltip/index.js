class Tooltip {
    static _instance;

    constructor() {
        if (!Tooltip._instance) {
            Tooltip._instance = this;
        }
        return Tooltip._instance;
    }

    render(tooltipText) {
        const element = document.createElement("div");
        element.innerHTML = tooltipText;
        element.className = "tooltip";
        this.element = element;
        document.body.append(this.element);
    }

    initialize() {
        document.addEventListener("pointerover", this.onMouseOver);
        document.addEventListener("pointerout", this.onMouseOut);
    }

    remove() {
        if (this.element) {
            this.element.remove();
            this.element = null;
            document.removeEventListener("pointermove", this.onMouseMove);
        }
    }

    destroy() {
        this.remove();
        document.removeEventListener("pointerover", this.onMouseOver);
        document.removeEventListener("pointerout", this.onMouseOut);
        document.removeEventListener("pointermove", this.onMouseMove);
    }

    onMouseOver = (event) => {
        const element = event.target.closest("[data-tooltip]");
        if (element) {
            this.render(element.dataset.tooltip);
            document.addEventListener("pointermove", this.onMouseMove);
        }
    }

    onMouseOut = (event) => {
        if (this.element) {
            this.remove();
        }
    }

    onMouseMove = (event) => {
        this.element.style.left = `${event.clientX}px`;
        this.element.style.top = `${event.clientY}px`;
    }
}

const tooltip = new Tooltip();

export default tooltip;

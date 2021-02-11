export default class NotificationMessage {
    static element = null;

    constructor(message, {duration = 1000, type = "success"} = {}) {
        this.message = message;
        this.duration = duration;
        this.type = type;
        this.render();
    }

    get template() {
        return `
        <div class="notification ${this.type}" style="--value:${this.duration / 1000}s">
        <div class="timer"></div>
        <div class="inner-wrapper">
          <div class="notification-header">${this.type}</div>
          <div class="notification-body">
            ${this.message}
          </div>
        </div>
      </div>
      `;
    }

    render() {
        const element = document.createElement("div");
        element.innerHTML = this.template;
        this.element = element.firstElementChild;
    }

    show(el) {
        if (NotificationMessage.element) {
            NotificationMessage.element.remove();
        }

        if (el) {
            el.append(this.element);
        } else {
            document.body.append(this.element);
        }

        NotificationMessage.element = this.element;
        setTimeout(() => this.remove(), this.duration);
    }

    remove() {
        if (this.element) {
            this.element.remove();
        }
    }

    destroy() {
        this.remove();
        this.element = null;
    }
}

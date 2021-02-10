export default class SortableTable {
    subElements = {};

    constructor(header, {data = []} = {}) {
        this.header = header;
        this.data = data;
        this.render();
    }

    getHeader(data) {
        return data.map(({id, title, sortable}) => {
            return `
            <div class="sortable-table__cell" data-id="${id}" data-sortable="${sortable}" data-order="">
                <span>${title}</span>
            </div>
            `;
        }).join("");
    }

    getBody(data) {
        return data.map(item => {
            const itemBody = this.header.map(({id, template = null}) => {
                if (template) {
                    return template(item[id]);
                }
                return `<div class="sortable-table__cell">${item[id]}</div>`;
            }).join("");

            return `
                <a href="/products/${item["id"]}" class="sortable-table__row">
                    ${itemBody}
                </a>
            `;
        }).join("");
    }

    get template() {
        return `
        <div data-element="productsContainer" class="products-list__container">
            <div class="sortable-table">
                <div data-element="header" class="sortable-table__header sortable-table__row">
                    ${this.getHeader(this.header)}
                </div>
                <div data-element="body" class="sortable-table__body">
                    ${this.getBody(this.data)}
                </div>
                <div data-element="loading" class="loading-line sortable-table__loading-line"></div>
                <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
                    <div>
                        <p>No products satisfies your filter criteria</p>
                        <button type="button" class="button-primary-outline">Reset all filters</button>
                    </div>
                </div>
            </div>
        </div>
        `;
    }

    sort(fieldValue, orderValue) {
        const header = this.header.find(item => item.id === fieldValue);
        if (!header.sortable) return;

        for (const child of this.subElements.header.children) {
            if (child.dataset.id === header.id) {
                child.dataset.order = orderValue;
            } else {
                child.dataset.order = "";
            }
        }

        const order = orderValue == "asc" ? 1 : -1;
        const compare = {
            "number": (a, b) => a - b,
            "string": (a, b) => a.localeCompare(b, ["ru", "en"], {caseFirst: "upper"}),
        }[header.sortType]
        const data = [...this.data].sort((a, b) => order * compare(a[fieldValue], b[fieldValue]));

        this.subElements.body.innerHTML = this.getBody(data);
    }

    render() {
        const element = document.createElement("div");
        element.innerHTML = this.template;
        this.element = element.firstElementChild;
        this.subElements = this.getSubElements(this.element);
    }

    getSubElements(element) {
        const elements = element.querySelectorAll('[data-element]');

        return [...elements].reduce((accum, subElement) => {
          accum[subElement.dataset.element] = subElement;

          return accum;
        }, {});
    }

    remove() {
        if (this.element) {
            this.element.remove();
        }
    }

    destroy() {
        this.remove();
        this.element = null;
        this.subElements = {};
    }
}


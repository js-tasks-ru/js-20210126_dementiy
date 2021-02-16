export default class SortableTable {
    subElements = {};

    constructor(header, {data = []} = {}) {
        this.header = header;
        this.data = data;
        this.defaults = {
            order: "asc",
            id: header.find(item => item.sortable).id,
        };
        this.render();
    }

    getHeader(data) {
        return data.map(({id, title, sortable}) => {
            const order = this.defaults.id === id ? this.defaults.order : "asc";
            const arrow = `
            <span data-element="arrow" class="sortable-table__sort-arrow">
                <span class="sort-arrow"></span>
            </span>
            `;
            return `
            <div class="sortable-table__cell" data-id="${id}" data-sortable="${sortable}" data-order="${order}">
                <span>${title}</span>
                ${this.defaults.id === id ? arrow : ''}
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

    getTable(data) {
        return `
        <div class="sortable-table">
            <div data-element="header" class="sortable-table__header sortable-table__row">
                ${this.getHeader(this.header)}
            </div>
            <div data-element="body" class="sortable-table__body">
                ${this.getBody(data)}
            </div>
        </div>
        `;
    }

    onSortClicked = (event) => {
        const column = event.target.closest('[data-sortable="true"]');
        if (column) {
            const { id, order } = column.dataset;
            const newOrder = order === "asc" ? "desc" : "asc";
            const data = this.sort(id, newOrder);
            const arrow = column.querySelector(".sortable-table__sort-arrow");

            column.dataset.order = newOrder;
            if (!arrow) {
                column.append(this.subElements.arrow);
            }

            this.subElements.body.innerHTML = this.getBody(data);
        }
    }

    sort(fieldValue, orderValue) {
        const header = this.header.find(item => item.id === fieldValue);
        const {sortType, customSorting, sortable} = header;
        if (!sortable) return;

        const order = orderValue === "asc" ? 1 : -1;
        const compare = {
            "number": (a, b) => a - b,
            "string": (a, b) => a.localeCompare(b, ["ru", "en"], {caseFirst: "upper"}),
            "custom": (a, b) => customSorting(a, b),
        }[sortType]

        return [...this.data].sort((a, b) => order * compare(a[fieldValue], b[fieldValue]));
    }

    render() {
        const element = document.createElement("div");
        const data = this.sort(this.defaults.id, this.defaults.order);

        element.innerHTML = this.getTable(data);
        this.element = element.firstElementChild;
        this.subElements = this.getSubElements(this.element);

        this.initEventListeners();
    }

    initEventListeners() {
        this.subElements.header.addEventListener("pointerdown", this.onSortClicked);
    }

    getSubElements(element) {
        const elements = element.querySelectorAll("[data-element]");

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
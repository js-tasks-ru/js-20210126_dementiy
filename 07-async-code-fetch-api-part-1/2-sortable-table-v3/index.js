import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class SortableTable {
    subElements = {};
    loadingLock = false;

    inverseOrder = (order) => {
        return {
            asc: "desc",
            desc: "asc"
        }[order];
    }

    onSortClicked = (event) => {
        const column = event.target.closest('[data-sortable="true"]');
        if (column) {
            const { id, order } = column.dataset;
            const newOrder = this.inverseOrder(order);
            const arrow = column.querySelector(".sortable-table__sort-arrow");
            
            column.dataset.order = newOrder;
            if (!arrow) {
                column.append(this.subElements.arrow);
            }

            this.defaults.id = id;
            this.defaults.order = newOrder;

            if (this.isLocalSorting) {
                const data = this.sort(id, newOrder);
                this.subElements.body.innerHTML = this.getBody(data);
            } else {
                this.sortOnServer(id, newOrder);
            }
        }
    }

    onScroll = async (event) => {
        // https://developer.mozilla.org/ru/docs/Web/API/Document/height
        const scrollHeight = document.documentElement.clientHeight;
        // https://developer.mozilla.org/ru/docs/Web/API/Element/getBoundingClientRect
        const domRect = this.element.getBoundingClientRect();
        const isBottom = domRect.bottom < scrollHeight;

        if (isBottom && !this.loadingLock) {
            this.loadingLock = true;
            this.start = this.end;
            this.end = this.end + 20;
            const data = await this.loadData(this.defaults.id, this.defaults.order, this.start, this.end);
            this.data = [...this.data, ...data];
            this.subElements.body.innerHTML = this.getBody(this.data);
            this.loadingLock = false;
        }
    }

    constructor(header, {url = ""} = {}) {
        this.header = header;
        this.url = new URL(url, BACKEND_URL);
        this.defaults = {
            order: "asc",
            id: header.find(item => item.sortable).id,
        };
        this.data = [];
        this.start = 1;
        this.end = 20;
        this.isLocalSorting = false;
        this.render();
    }

    async loadData(sort, order, start, end) {
        this.url.searchParams.set("_sort", sort);
        this.url.searchParams.set("_order", order);
        this.url.searchParams.set("_start", start);
        this.url.searchParams.set("_end", end);
        const data = await fetchJson(this.url);

        if (data.length) {
            this.element.classList.remove("sortable-table_empty");
        } else {
            this.element.classList.add("sortable-table_empty");
        }

        return data;
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

    getTable() {
        return `
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
        `;
    }

    sort(id, order) {
        const header = this.header.find(item => item.id === id);
        const {sortType, customSorting, sortable} = header;
        if (!sortable) return;

        const direction = order === "asc" ? 1 : -1;
        const compare = {
            "number": (a, b) => a - b,
            "string": (a, b) => a.localeCompare(b, ["ru", "en"], {caseFirst: "upper"}),
            "custom": (a, b) => customSorting(a, b),
        }[sortType]

        return [...this.data].sort((a, b) => direction * compare(a[id], b[id]));
    }

    async sortOnServer(id, order) {
        const data = await this.loadData(id, order, 1, 20);
        this.subElements.body.innerHTML = this.getBody(data);
    }

    async render() {
        const element = document.createElement("div");
        element.innerHTML = this.getTable();
        this.element = element.firstElementChild;
        this.subElements = this.getSubElements(this.element);
        this.initEventListeners();
        const data = await this.loadData(this.defaults.id, this.defaults.order, this.start, this.end);
        this.subElements.body.innerHTML = this.getBody(data);
    }

    initEventListeners() {
        this.subElements.header.addEventListener("pointerdown", this.onSortClicked);
        document.addEventListener("scroll", this.onScroll);
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
            document.removeEventListener("scroll", this.onScroll);
        }
    }

    destroy() {
        this.remove();
        this.element = null;
        this.subElements = {};
    }
}

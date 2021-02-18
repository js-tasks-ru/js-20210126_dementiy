import fetchJson from './utils/fetch-json.js';


export default class ColumnChart {
    element;
    subElements;
    chartHeight = 50;
    BASE_URL = "https://course-js.javascript.ru/";

    constructor({
        url = "",
        range = {
            from: new Date(),
            to: new Date()
        },
        formatHeading = data => data,
        label = "",
        link = "",
        value = 0
    } = {}) {
        this.url = new URL(url, this.BASE_URL);
        this.range = range;
        this.formatHeading = formatHeading
        this.title = label;
        this.link = link;
        this.header = value;
        this.render();

        const {from, to} = range
        this.loadData(from, to);
    }

    getBody(data) {
        const values = Object.values(data);
        const maxValue = Math.max(...values);
        const scale = this.chartHeight / maxValue;
        return values.map(item => {
            const value = Math.floor(item * scale);
            const percent = (item / maxValue * 100).toFixed(0);
            return `<div style="--value: ${value}" data-tooltip="${percent}%"></div>`; 
        }).join("");
    }

    get template() {
        return `
        <div class="column-chart column-chart_loading" style="--chart-height: ${this.chartHeight}">
            <div class="column-chart__title">
                Total ${this.title}
                <a class="column-chart__link" href="${this.link}">View all</a>
            </div>
            <div class="column-chart__container">
                <div data-element="header" class="column-chart__header">
                </div>
                <div data-element="body" class="column-chart__chart">
                </div>
            </div>
        </div>
        `;
    }

    render() {
        const element = document.createElement("div");
        element.innerHTML = this.template;
        this.element = element.firstElementChild;
        this.subElements = this.getSubElements(this.element);
    }

    async loadData(from, to) {
        this.url.searchParams.set("from", from.toISOString());
        this.url.searchParams.set("to", to.toISOString());
        const data = await fetchJson(this.url);

        if (data) {
            this.element.classList.remove("column-chart_loading");
            this.subElements.header.textContent = this.formatHeading(
                Object.values(data).reduce((a,b) => a + b, 0)
            );
            this.subElements.body.innerHTML = this.getBody(data);
        }
    }

    async update(from, to) {
        this.range.from = from;
        this.range.to = to;
        await this.loadData(from, to);
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

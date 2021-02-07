export default class ColumnChart {
    chartHeight = 50;

    constructor({data = [], label = "", link = "", value = 0} = {}) {
        this.data = data;
        this.title = label;
        this.link = link;
        this.header = value;
        this.render();
    }

    render() {
        const element = document.createElement("div");
        const body = this.getBody(this.data);

        element.innerHTML = `
        <div class="column-chart" style="--chart-height: ${this.chartHeight}">
            <div class="column-chart__title">
                Total ${this.title}
                <a class="column-chart__link" href="${this.link}">View all</a>
            </div>
            <div class="column-chart__container">
                <div data-element="header" class="column-chart__header">
                    ${this.header}
                </div>
                <div data-element="body" class="column-chart__chart">
                    ${body}
                </div>
            </div>
        </div>
        `;
        this.element = element.firstElementChild;

        if (!this.data.length) {
            this.element.classList.add("column-chart_loading");
        }
    }

    getBody(data) {
        const maxValue = Math.max(...data);
        const scale = this.chartHeight / maxValue;
        return this.data.map(item => {
            const value = Math.floor(item * scale);
            const percent = (item / maxValue * 100).toFixed(0);
            return `<div style="--value: ${value}" data-tooltip="${percent}%"></div>`; 
        }).join("");
    }

    update(data) {
        this.data = data;
        const chart = this.element.querySelector('.column-chart__chart');
        chart.innerHTML = this.getBody(data);
    }

    remove() {
        this.element.remove();
    }

    destroy() {
    }
}

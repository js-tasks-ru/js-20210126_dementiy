import escapeHtml from './utils/escape-html.js';
import fetchJson from './utils/fetch-json.js';

const IMGUR_CLIENT_ID = '28aaa2e823b03b1';
const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ProductForm {
    constructor (productId) {
        this.productId = productId;
        this.defaultProductData = {
            title: '',
            description: '',
            quantity: 1,
            subcategory: '',
            status: 1,
            images: [],
            price: 100,
            discount: 0
        };
    }

    onSubmit = event => {
        event.preventDefault();
        this.save();
    };

    uploadImage = event => {
        const input = document.createElement('input');
        input.type = "file";
        input.accept = "image/*";

        input.onchange = async () => {
            const formData = new FormData();
            const { imageListContainer } = this.subElements;
            const file = input.files[0];
            formData.append("image", file);
            const response = await fetchJson("https://api.imgur.com/3/image", {
                method: "POST",
                headers: {
                    Authorization: `Client-ID ${IMGUR_CLIENT_ID}`,
                },
                body: formData
            });
            
            const image = {
                url: response.data.link,
                source: file.name,
            }

            const li = document.createElement("div");
            li.innerHTML = this.getImage(image);
            const ul = imageListContainer.querySelector("ul");
            ul.appendChild(li.firstElementChild);
        };

        input.click();
    }

    getForm() {
        return `
        <div class="product-form">
            <form data-element="productForm" class="form-grid">
                <div class="form-group form-group__half_left">
                    <fieldset>
                        <label class="form-label">Название товара</label>
                        <input required="" id="title" type="text" name="title" data-element="productTitle" class="form-control" placeholder="Название товара">
                    </fieldset>
                </div>
                <div class="form-group form-group__wide">
                    <label class="form-label">Описание</label>
                    <textarea required="" id="description" class="form-control" name="description" data-element="productDescription" placeholder="Описание товара"></textarea>
                </div>
                <div class="form-group form-group__wide" data-element="sortable-list-container">
                    <label class="form-label">Фото</label>
                    <div data-element="imageListContainer">
                        <ul class="sortable-list">
                        </ul>
                    </div>
                    <button type="button" data-element="uploadImage" name="uploadImage" class="button-primary-outline"><span>Загрузить</span></button>
                </div>
                <div class="form-group form-group__half_left">
                    <label class="form-label">Категория</label>
                    <select class="form-control" data-element="productCategory" id="subcategory" name="subcategory">
                    </select>
                </div>
                <div class="form-group form-group__half_left form-group__two-col">
                    <fieldset>
                        <label class="form-label">Цена ($)</label>
                        <input required="" id="price" type="number" name="price" data-element="productPrice" class="form-control" placeholder="100">
                    </fieldset>
                    <fieldset>
                        <label class="form-label">Скидка ($)</label>
                        <input required="" id="discount" type="number" name="discount" data-element="productDiscount" class="form-control" placeholder="0">
                    </fieldset>
                </div>
                <div class="form-group form-group__part-half">
                    <label class="form-label">Количество</label>
                    <input required="" id="quantity" type="number" data-element="productQuantity" class="form-control" name="quantity" placeholder="1"></input>
                </div>
                <div class="form-group form-group__part-half">
                    <label class="form-label">Статус</label>
                    <select id="status" data-element="productStatus" class="form-control" name="status">
                        <option value="1">Активен</option>
                        <option value="0">Неактивен</option>
                    </select>
                </div>
                <div class="form-buttons">
                    <button type="submit" name="save" class="button-primary-outline">
                        ${this.productId ? "Сохранить" : "Добавить"}
                    </button>
                </div>
            </form>
        </div>
        `
    }

    createCategories(categories) {
        const options = [];
        for (const category of categories) {
            for (const child of category.subcategories) {
                const option = new Option(`${category.title} > ${child.title}`, child.id);
                options.push(option);
            }
        }
        return options;
    }

    createImages(images) {
        return images.map(image => {
            return this.getImage(image);
        }).join("");
    }

    getImage(image) {
        return `
        <li class="products-edit__imagelist-item sortable-list__item" style="">
            <input type="hidden" name="url" value="${escapeHtml(image.url)}">
            <input type="hidden" name="source" value="${escapeHtml(image.source)}">
            <span>
            <img src="icon-grab.svg" data-grab-handle="" alt="grab">
            <img class="sortable-table__cell-img" alt="${escapeHtml(image.source)}" src="${escapeHtml(image.url)}">
            <span>${escapeHtml(image.source)}</span>
            </span>

            <button type="button">
                <img src="icon-trash.svg" data-delete-handle="" alt="delete">
            </button>
        </li>
        `;
    }

    async render () {
        const categoriesUrl = new URL("api/rest/categories", BACKEND_URL);
        categoriesUrl.searchParams.set("_sort", "weight");
        categoriesUrl.searchParams.set("_refs", "subcategory");
        const categoriesData = await fetchJson(categoriesUrl);

        let productData = null;
        if (this.productId) {
            const productUrl = new URL("api/rest/products", BACKEND_URL);
            productUrl.searchParams.set("id", this.productId);
            const productResponse = await fetchJson(productUrl);
            [productData] = productResponse;
        } else {
            productData = this.defaultProductData;
        }
        
        const element = document.createElement("div");
        element.innerHTML = this.getForm(productData);
        this.element = element.firstElementChild;
        this.subElements = this.getSubElements(element);

        this.setFormData(productData, categoriesData);
        this.initEventListeners();

        return this.element;
    }

    async save() {
        const formData = this.getFormtData();

        try {
            const product = await fetchJson(`${BACKEND_URL}/api/rest/products`, {
                method: this.productId ? "PATCH" : "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(formData)
            });
            this.dispatchEvent(product);
        } catch (error) {
            console.error(error);
        }
    }

    dispatchEvent(product) {
        const event = this.productId
            ? new CustomEvent("product-updated", { detail: product.id })
            : new CustomEvent("product-saved");
        this.element.dispatchEvent(event);
    }

    getFormtData() {
        const images = [];
        const htmlImages = this.subElements
            .imageListContainer
            .querySelectorAll('.sortable-table__cell-img');

        [].forEach.call(htmlImages, function(image) {
            images.push({
                url: image.src,
                source: image.alt
            });
        });
        
        const formData = {
            "id": this.productId,
            "title": this.subElements.productTitle.value,
            "description": this.subElements.productDescription.value,
            "price": parseInt(this.subElements.productPrice.value),
            "discount": parseInt(this.subElements.productDiscount.value),
            "quantity": parseInt(this.subElements.productQuantity.value),
            "status": parseInt(this.subElements.productStatus.value),
            "images": images,
        };
        return formData;
    }

    setFormData(productData, categoriesData) {
        this.subElements.productTitle.value = productData.title;
        this.subElements.productDescription.value = productData.description;
        if (productData.images) {
            const ul = this.subElements.imageListContainer.querySelector("ul");
            ul.innerHTML = this.createImages(productData.images);
        }
        const categoryOptions = this.createCategories(categoriesData);
        categoryOptions.forEach(option => {
            this.subElements.productCategory.add(option);
        })
        this.subElements.productPrice.value = productData.price;
        this.subElements.productDiscount.value = productData.discount;
        this.subElements.productQuantity.value = productData.quantity;
        this.subElements.productStatus.value = productData.status;
    }

    initEventListeners() {
        const { productForm, uploadImage } = this.subElements;
        productForm.addEventListener("submit", this.onSubmit);
        uploadImage.addEventListener("click", this.uploadImage);
    }

    getSubElements(element) {
        const elements = element.querySelectorAll("[data-element]");

        return [...elements].reduce((accum, subElement) => {
          accum[subElement.dataset.element] = subElement;

          return accum;
        }, {});
    }

    destroy () {
        this.remove();
        this.element = null;
        this.subElements = null;
    }

    remove () {
        this.element.remove();
    }
}

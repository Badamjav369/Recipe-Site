export class RecipesInfo extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.innerHTML = `
    <main class="recipes">
        <section class="recipe-info">
            <img src="images\food-images\burger.jpg" alt="spaghetti">
            <article>
                <h2>Төмсний хучмал</h2>
                <p>Хоолны талаарх дэлгэрэнгүй мэдээлэл, анхаарвал зохих зүйлсийн талаар дурдах</p>
                <button class="save">Хадгалах</button>
                <button class="rate">Үнэлгээ өгөх</button>
            </article>
        </section>
        <aside>
            <article class="ingredients">
                <h2>Орц</h2>
                <ol>
                    <li>Төмс 6-8 ширхэг</li>
                    <li>Үхрийн мах 300-400гр</li>
                    <li>Сонгино 1 ширхэг</li>
                    <li>Хар перц 1 тал халбага</li>
                    <li>Тос 2-3 халба   га</li>
                    <li>Сүү 100-150мл</li>
                    <li>Өндөг 1 ширхэг</li>
                    <li>Давс 1 халбага</li>
                </ol>  
            </article>
            <article class="info">
                <h2>Нэмэлт мэдээлэл</h2>
                <ol>
                    <li>Орц шинэхэн байх – хамгийн сайн амт, бүтэц гаргахын үндэс болдог.</li>
                    <li>Зуух, сав тохирох – жигд халдаг зуух, наалддаггүй сав илүү найдвартай.</li>
                </ol>
            </article>
        </aside>
        <section>
            <article class="steps">
                <h2>Хийх дараалал</h2>
                <ol>
                    <li>Төмсөө угааж арилгасны дараа давстай усанд зөөлөртөл нь чанаж, шүүж халуун дээр нь нухна.</li>
                    <li>Нухсан төмсөндөө бага зэрэг сүү, цөцгийн тос, давс, перец нэмж зөөлөн болгон амтална.</li>
                    <li>Татсан мах, жижиглэсэн сонгино, сармисыг тосонд бор шаргал болтол хуурч, давс, перецээр амтална.</li>
                    <li>Шарах савны ёроолыг нимгэн тосолж, наалдахаас сэргийлнэ.</li>
                </ol>
            </article>
        </section>
        <foods-section title="✨Ойролцоо хоолнууд✨"></foods-section>
    </main>
    `;
  }
}
customElements.define('recipe-info', RecipesInfo);

const socket = io('/');

//Global variables
const userFormInfo = document.querySelector('#submitFormInfo');
const formBtn = document.getElementById('btnFormUser');
const nombreUser = document.querySelector('#floatingInputNameUser');
const emailUser = document.querySelector('#floatingInputEmail');
const userInteraction = document.querySelector('#userInteraction');
const userForm = document.querySelector('#userForm');
const userName = document.getElementById('userName');

//Producto
const productForm = document.querySelector('#productForm');
const productsBtn = document.getElementById('productsBtn');
const productoName = document.getElementById('floatingInputName');
const productoPrice = document.getElementById('floatingInputPrice');
const productoUrl = document.getElementById('floatingInputUrl');
const table = document.getElementById('tableproductData');

//CHATS
const chatForm = document.querySelector('#chatForm');
const messages = document.querySelector('#userMessage');
const btnChatSubmit = document.querySelector('#submitBtnMessage');
const chatContainer = document.querySelector('#chatContainer');

let usuario;

//SUBMIT INFO
formBtn.onclick = e => {
    e.preventDefault();

    let user = { name: nombreUser.value, email: emailUser.value };

    socket.emit('userInfo', user);
    userFormInfo.reset();

};

socket.on('usuario', async data => {
    usuario = data;

    if(usuario) {
        userForm.classList = 'userInfoRemove';
        userName.textContent = usuario.name;
        userInteraction.classList.remove('productInfoRemoved');

        try {
            const res = await fetch('http://localhost:8080/db/chat.json');
            const data = await res.json();

            const html = `
                {{#each data}}
                    <p><span class="fw-bold text-primary">{{ email }}</span> <span class="fw-normal brown">{{ date }}: </span><span class="fst-italic text-success">{{ message }}</span></p>
                {{/each}}
            `;
            
            const template = Handlebars.compile(html);
            const oldMessages = template({data});
        
            chatContainer.innerHTML = oldMessages;            
        } catch(err) {
            console.log('Error al traer los datos:', err.message);
        };    
    };
});

//Products form
productsBtn.onclick = e => {
    e.preventDefault();

    let product = { name: productoName.value, price: productoPrice.value, url: productoUrl.value };
    productForm.reset();

    socket.emit('product', product);
};

socket.on('allProducts', newInfo => {
    document.getElementById('warningProducts').classList = 'emptyListProducts';
    document.getElementById('productsTable').classList.remove('emptyListProducts');

    const html = `
        {{#each newInfo}}
            <tr>
                <th scope="row" class="text-center">{{ name }}</th>
                <td class="text-center">$ {{ price }}</td>
                <td class="text-center">
                    <img height="75px" width="120px" src={{ url }} alt={{ name }} />
                </td>
            </tr>
        {{/each}}
    `;
    
    const template = Handlebars.compile(html);
    const data = template({newInfo});

    table.innerHTML = data;
});

//SUBMIT MESSAGE
btnChatSubmit.onclick = e => {
    e.preventDefault();

    //Get object
    const date = new Date(Date.now()).toLocaleString().replace(',', '');
    const fecha = `[${date}]`

    const mensaje = { email: usuario.email, date: fecha, message: messages.value};

    socket.emit('client:newMessage', mensaje);
    chatForm.reset();
};

socket.on('server:messages', mess => {
    const templateMess = `
        {{#each mess}}
            <p><span class="fw-bold text-primary">{{ email }}</span> <span class="fw-normal brown">{{ date }}: </span><span class="fst-italic text-success">{{ message }}</span></p>
        {{/each}}
    `;

    const template = Handlebars.compile(templateMess);
    const newMessages = template({mess});

    chatContainer.innerHTML = newMessages;
});
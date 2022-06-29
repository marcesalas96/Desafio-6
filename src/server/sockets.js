import fs from 'fs';

let porductsData = [];
let messagesData = JSON.parse(fs.readFileSync('./src/public/db/chat.json', 'utf-8'));

//WEB SOCKETS EVENTS
export const socketsEvents = io => {
    io.on('connection', socket => {
        console.log('New Connection!!!', socket.id);

        socket.on('userInfo', (user) => {
            socket.emit('usuario', user);
        });

        socket.on('product', product => {
            let objectId = 0;
            const { name, price, url } = product;
            if(porductsData.length == 0) {
                objectId = 1;
            } else {
                let arr = [];
                porductsData.forEach(item => {
                    arr.push(item.id);
                });
        
                const maxValue = Math.max(...arr);
                objectId = maxValue + 1;
            };
        
            let newProduct = {
                id: objectId,
                name,
                price: Number(price),
                url
            };

            porductsData.push(newProduct);

            io.emit('allProducts', porductsData);
        });

        socket.on('client:newMessage', message => {
            messagesData.push(message);
            fs.writeFileSync('./src/public/db/chat.json', JSON.stringify(messagesData), 'utf8');
            io.emit('server:messages', messagesData);
        });
    });
};
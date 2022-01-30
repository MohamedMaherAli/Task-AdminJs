const mongoose = require('mongoose');
const express = require('express');
const AdminJS = require('adminjs');
const AdminJSExpress = require('@adminjs/express');
AdminJS.registerAdapter(require('@adminjs/mongoose'));
const app = express();
const bcrypt = require('bcrypt');
const session = require('express-session');


//Models
const User = require('./models/user.model');
const Ticket = require('./models/ticket.model');


const adminJs = new AdminJS({
    resources: [{
        resource: User,
        options: {
            properties: {
                encryptedPassword: {
                    isVisible: false
                },
                password: {
                    type: String,
                    list: false, edit: true, filter: false, show: false
                }
            },
            actions: {
                new: {
                    before: async (request) => {
                        if(request.payload.password) {
                            request.payload = {
                                ...request.payload,
                                encryptedPassword: await bcrypt.hash(request.payload.password, 10),
                                password: undefined
                            }
                        }
                        return request;
                    },
                    isAccessible: ({ currentAdmin }) => currentAdmin && currentAdmin.role === 'admin'
                },
                edit: {
                    isAccessible: ({ currentAdmin }) => currentAdmin && currentAdmin.role === 'admin'
                },
                delete: {
                    isAccessible: ({ currentAdmin }) => currentAdmin && currentAdmin.role === 'admin'
                },
                bulkDelete: {
                    isAccessible: ({ currentAdmin }) => currentAdmin && currentAdmin.role === 'admin'
                },
                show: {
                    isAccessible: ({ currentAdmin, record }) => currentAdmin && currentAdmin.role === 'admin' ||
                    currentAdmin && currentAdmin.role === 'service' ||
                    currentAdmin && currentAdmin._id === record.param('_id')
                },
                list: {
                    isAccessible: ({ currentAdmin }) => currentAdmin && currentAdmin.role === 'admin' 
                }
            }
        }
    }, {
        resource: Ticket,
        options: {
            properties: {
                customerId: {
                    isVisible: {
                        edit: false,
                        show: true,
                        list: true,
                        filter: true
                      }
                }
            },
            actions: {
                new: {
                    before: async(request, {currentAdmin}) => {
                        request.payload = {
                            ...request.payload,
                            customerId: currentAdmin._id,
                            status: 'active'
                        }
                        return request;
                    },
                    isAccessible: ({ currentAdmin }) => currentAdmin && currentAdmin.role === 'customer'
                },
                edit: {
                    isAccessible: ({ currentAdmin, record }) => currentAdmin && currentAdmin.role === 'admin' ||
                    currentAdmin && currentAdmin.role === 'service' ||
                    currentAdmin && currentAdmin._id === record.param('customerId')
                },
                bulkDelete: {
                    isAccessible: ({ currentAdmin }) => currentAdmin && currentAdmin.role === 'admin'
                },
                delete: {
                    isAccessible: ({ currentAdmin }) => currentAdmin && currentAdmin.role === 'admin'
                }
            }
        }
    }],
    rootPath: '/admin',
});



//Authentication
const router = AdminJSExpress.buildAuthenticatedRouter(adminJs, {
    authenticate: async(email, password) => {
        const user = await User.findOne({email});
        if(user) {
            const matchPassword = await bcrypt.compare(password, user.encryptedPassword);
            if(matchPassword) {
                return user;
            }
        }
        return false;
    },
    cookiePassword: 'secretCookie123456'
})

//session config
app.use(session({
    secret: 'secretCookie123456',
    resave: true,
    saveUninitialized: true
}))

app.use(adminJs.options.rootPath, router);

//Starting Server
const run = async () => {
    await mongoose.connect(process.env.MONGO_URL)
    app.listen(process.env.PORT, () => console.log(`Example app listening on port 8080!`));
}
  
run();



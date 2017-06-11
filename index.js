var express = require("express");
var app = express();
const Sequelize = require('sequelize');
const sequelize = new Sequelize('c9', 'unknownazazel', '', {
    host: process.env.IP,
    dialect: 'mysql'
});


var cx = '003697610006780978114:my8kdtrflag';
var appid = 'gseapifreecodecamp';
const GoogleImages = require('google-images');
const client = new GoogleImages(cx, appid);
var Bing = require('node-bing-api')({
    accKey: "12b3a7076dcb4f2eadd0bbd6aa96682c"
});



sequelize
    .authenticate()
    .then(() => {
        console.log('Connection has been established successfully.');
    });


const model = sequelize.define('imgsearch', {
        query: {
            type: Sequelize.STRING,
            allowNull: false,
            unique: true
        },

    }, {
        createdAt: false
    }


);

/*//test val
model.sync({
    force: true
}).then(() => {
    return model.create({
        query: 'test'
    });
});
*/

app.get("/recent", function(req, res) {
    model.findAll({
        limit: 10,
        order: [
            ['updatedAt', 'DESC']
        ]
    }).then(result => {
        res.send(result);


    })




});
app.get('/favicon.ico', function(req, res) {
    res.sendStatus(204);
});

app.get('/*', function(req, resp) {
    //remove trailing slash
    var url = urldecode(JSON.stringify(req.originalUrl)).replace(/\//, "").replace(/\"/g, "");
    if (url == '') {

        url = 'x';
    }

    var ret = [];
    var off = 0;
    if (req.query.offset) {
        off = req.query.offset;

    }
    model.findOrCreate({
        where: {
            query: url
        }
    }).spread((item, created) => {
        if (!created) {
            model.update({
                query: url
            }, {
                where: {
                    query: item.query
                }
            }).then((x, y) => {
                console.log(y);

            })

        }

    });

    Bing.images(url, function(error, res, body) {
        //resp.send(JSON.stringify(body, null, 4));
        for (var i = 0; i < body.value.length; i++) {
            var tmp = {
                alt: body.value[i].name,
                image: body.value[i].contentUrl,
                source: body.value[i].hostPageUrl


            };

            ret.push(tmp);


        }


        resp.send(ret);
    }, {
        skip: off
    });

});

app.listen(process.env.PORT, function() {
    console.log('Example app listening on port' + process.env.PORT);

});


function urldecode(str) {
    return decodeURIComponent((str + '').replace(/\+/g, '%20'));
}

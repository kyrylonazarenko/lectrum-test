const fs = require('fs');
const _ = require('lodash');

let db;

exports.connect = function loadFile() {
    return new Promise((resolve, reject) => {
        fs.readFile(__dirname + '/../db/users.json', (err, data) => {
            if (err) return reject(err);
            try {
                db = JSON.parse(data);
                resolve(true);
            } catch (err) {
                db = [];
            }
        });
    });
};

function saveToFile() {
    return new Promise((resolve, reject) => {
        fs.writeFile(__dirname + '/../db/users.json', JSON.stringify(db), (err, data) => {
            if (err) return reject(err);
            resolve(true);
        });
    });
}
exports.find = async function (filter) {
    try {
        if (!db)  {
            await this.connect();
        }
        return _.find(db, filter);
    } catch (err) {
        throw err;
    }
};

exports.create = async function (data) {
    try {
        if (!db)  {
            await this.connect();
        }
        if (_.find(db, {email: data.email})) throw new Error('Such user already exists');

        const newUser = _.pick(data, ['firstName', 'lastName', 'tel', 'email', 'password', 'meta']);
        const ids = _.map(db, 'id');
        if (ids.length > 0) {
            newUser.id = Math.max(...ids) + 1;
        } else {
            newUser.id = 1;
        }
        db.push(newUser);
        saveToFile();
        return newUser;
    } catch (err) {
        throw err;
    }
};

exports.update = async function (data) {
    try {
        if (!db) {
            await this.connect();
        }
        const user = _.find(db, {id: data.id});
        if (!user) throw new Error('No such user');

        const newUserData = _.pick(data, ['firstName', 'lastName', 'tel', 'email', 'meta']);
        _.assign(user, newUserData);
    } catch (err) {
        throw err
    }
};

exports.delete = async function (id) {
    try {
        if (!db) {
            await this.connect();
        }
        if (!_.find(db, {id})) throw new Error('No such user');
        _.remove(db, {id});
        saveToFile();
    } catch (err) {
        throw err;
    }
};

exports.findAll = async function () {
    try {
        if (!db) {
            await this.connect();
        }
        return db.map((user) => _.pick(user, ['id', 'firstName', 'lastName', 'tel', 'email']));
    } catch (err) {
        throw err;
    }
};
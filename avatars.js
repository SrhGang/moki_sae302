const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('ChatAppDB.db');

// var imagePaths = [
//   'assets/img/peeps-avatar-alpha.png', 
//   'assets/img/peeps-avatar-alpha-2.png',
//   'assets/img/peeps-avatar-alpha-3.png', 
//   'assets/img/peeps-avatar-alpha-4.png',
//   'assets/img/peeps-avatar-alpha-5.png',
//   'assets/img/peeps-avatar-alpha-6.png',
//   'assets/img/peeps-avatar-alpha-7.png',
//   'assets/img/peeps-avatar-alpha-8.png',
//   'assets/img/peeps-avatar-alpha-9.png'];
// imagePaths.forEach(function(imagePath) {
//     var type = 'utilisateur';  // 'utilisateur' ou 'groupe'
//     var image = fs.readFileSync(imagePath);
//     db.run("INSERT INTO Avatars (image, type) VALUES (?, ?)", [image, type], function(err) {
//       if (err) {
//         return console.log(err.message);
//       }
//       console.log("Image pour utilisateur insérée avec succès");
//     });
// });


var imageGroupPath = [
  'Avatar/1454641761-312a147281173a99e78c10975f9debc31998aa32f388f45ffcca8e1282a09992-d.jpg',
  'Avatar/1454641991-2fcb2241731449bf018d71f9b6d82de1e5290fa7c06788edf4365a4932285e5b-d.png',
  'Avatar/1454642023-b9bad7abb5973a10ddf2f488dd91cdb54ce11ad0c06e6f0c19d297df02aecc86-d.png',
  'Avatar/1454642050-87cdaf9245931e26f1805e9145ec5a4d5b3594ec372629ec7bff674333e1e041-d.jpg'
];

imageGroupPath.forEach(function(imagePath) {
  var type = 'groupe';  // 'utilisateur' ou 'groupe'
  var image = fs.readFileSync(imagePath);
  db.run("INSERT INTO Avatars (image, type) VALUES (?, ?)", [image, type], function(err) {
    if (err) {
      return console.log(err.message);
    }
    console.log("Image pour groupe insérée avec succès");
  });
});

db.close();

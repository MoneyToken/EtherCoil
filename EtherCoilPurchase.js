/*
The sketch reads the 256-bit long hashes of transactions on Ethereum blockchain and uses them 
 to forge brand new deterministic artworks.   
 
 Code inspired by Matt Pearson (http://zenbullets.com/), 
 written by Massimo Franceschet (https://twitter.com/HEX0x6C), 
 checked by Erick Calderon (@snowfro)
 for Art Blocks project (https://www.artblocks.io/).
 */

var a; // semi-major axis of the ellipse
var b; // semi-minor axis of the ellipse
var stepa, stepb; // axis increment
var lastx, lasty, x, y; // previous and current coordinates
var noi; // Perlin noise 
var variance; // axis variabce
var tiltStart; // initial angle
var tiltEnd;   // final angle
var tiltStep;  // angle increment
var rand = false; // random behaviour
var ncoils = 100; // number of coils
var artNodeOld = "0xAba3A91D01b6f0766E769131D479cAdE6F132984" // old art node 
var artNodeNew = "0xd5027a93d556b9c4d07db2c9ef6624de041ec7a3" // new art node
var artNodeTest = "0x0d66d4be9342fbed92f28de8c34cbedacb9cb7f0" // test art node
var homestead = "http://art-blocks-endpoints.whatsthescore.webfactional.com/homestead/"; // endpoint url
var homesteadTest = "http://art-blocks-endpoints.whatsthescore.webfactional.com/ropsten/"; // test endpoint url
var endpoint;
var oldBlocknumber = 0; // old blocknumber
var blocknumber; // current blocknumber
var hash; // hash string
var bin; // binary hash string
var index = 0; // index in bin string
var img;
var img2;
var saved = false;
var zero = "0x0000000000000000000000000000000000000000000000000000000000000000"

  function preload() {
  img = loadImage("QR.png");
}


function setup() {
  //endpoint = homesteadTest + artNodeTest + "/blocknumber"; // test network
  endpoint = homestead + artNodeNew + "/blocknumber"; // main network
  var myCanvas = createCanvas(1000, 1000);
  myCanvas.parent('myContainer');
  loadJSON(endpoint, pickJSON);
}

function draw() {
  //loadJSON(endpoint, pickJSON);
}

window.setInterval(function() {
    loadJSON(endpoint, pickJSON)
  }, 5000);

// pick and process JSON
function pickJSON(json) {
  blocknumber = json.blocknumber;
  hash = json.hash;  
  // if hash is null print QR code
  if (hash === zero) {
    document.getElementById("hash").innerHTML = "INSERT COIN...";
    console.log("Blocknumber:", blocknumber, "Hash:", hash);
    background(255);
    drawQR();
  } else {
  // if hash not null and there is a new block print the coil and save it  
    if (blocknumber > oldBlocknumber) {
      console.log("Blocknumber:", blocknumber, "Hash:", hash);
      document.getElementById("hash").innerHTML = hash;
      oldBlocknumber = blocknumber;
      // remove prefix
      hash = hash.substring(2, hash.length);
      // convert to bin
      bin = hexToBin(hash);
      // draw coils
      background(255);
      drawCoils(ncoils);
      if (!saved) {
        saveCanvas("HashCoil"+blocknumber+".jpg");
        saved = true;
      }
    }
  }
}

function drawQR() {  
  var side = 600;
  image(img, (width - side)/2, (height - side)/2, side, side);
}

// draw n coils using hash binary string
function drawCoils(n) {
  background(255);
  index = 0;
  variance = 200;
  stepa = 0.5;
  stepb = 0.5;
  for (var i=0; i < n; i++) {
    a = 10;
    b = 10;
    strokeWeight(random(2));
    noiseSeed(fib(i));
    noi = hashRandom(100);
    var col = color(hashRandom(200), hashRandom(200), hashRandom(200));
    var alpha = hashRandom(200);
    stroke(col, alpha);

    startTilt = radians(hashRandom(360));
    endTilt = radians(360 * 4 + hashRandom(360 * 4));
    randomSeed(fib(i));
    stepTilt = radians(3 + hashRandom(100)/20);

    x = width/2  + a * cos(startTilt);
    y = height/2 + b * sin(startTilt);

    drawCoil();
  }
}

// draw a single coil
function drawCoil() {

  var mya, myb;

  for (var alpha = startTilt; alpha < endTilt; alpha += stepTilt) {

    lastx = x;
    lasty = y;  

    mya = a + (noise(noi) - 0.5) * variance;
    myb = b + (noise(noi) - 0.5) * variance;

    x = width/2 +  mya * cos(alpha);
    y = height/2 + myb * sin(alpha);

    line(x, y, lastx, lasty);

    a = a + stepa;
    b = b + stepb;

    noi = noi + 0.05;
  }
}

// faithful hex to bin translation using big int library https://github.com/peterolson/BigInteger.js
function hexToBin(hex) {
  return bigInt(hex, 16).toString(2);
}

// extract a random value in [0,n] using the binary hash string (bin) starting at index
function hashRandom(n) {
  var m = Math.ceil(2*Math.log2(n));
  var sub;
  if ((index + m) < bin.length) {
    sub = bin.slice(index, index + m);
  } else {
    index = 0;
    sub = bin.slice(index, index + m);
  }
  index = index + m;
  var x = parseInt(sub, 2);
  var y = map(x, 0, Math.pow(2, m) - 1, 0, n);
  return y;
}

// Fibonacci numbers
function fib(n) {
  var fib1 = 1;
  var fib2 = 1;
  var fib3 = 1;
  if (n<=2) {
    return 1;
  } else {
    for (var i = 3; i <= n; i++) {
      fib3 = fib1 + fib2;
      fib1 = fib2;
      fib2 = fib3;
    }
    return fib3;
  }
}

// log base b
function logb(a, b) {
  return Math.log(a)/Math.log(b);
}

// log base 2
function log2(a) {
  return logb(a, 2);
}

// save cancas on key released
function keyReleased() {
  // save frame with key s or S
  if (key == 's' || key == 'S') saveCanvas("HashCoil"+blocknumber+".jpg");
}

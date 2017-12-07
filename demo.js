

var vertexShaderSource = `#version 300 es

in vec4 a_position;
in vec2 a_texcoord;

out vec2 v_texcoord;

void main() {
  
  gl_Position = a_position;
  v_texcoord = a_texcoord;
}
`;

var vertexShaderTranslate = `
in vec4 a_position;
in vec2 a_texcoord;
in vec4 translation;

out vec2 v_texcoord;

void main() {
  gl_Position = a_position + translation;
  v_texcoord = a_texcoord;
}`;

var vertexShaderScale = `
  in vec4 a_position;
  in vec2 a_texcoord;
  in mat4 u_formMatrix;

  out vec2 v_texcoord;

  void main() {
    gl_Position = a_position + u_formMatrix;
    v_texcoord = a_texcoord;
  }
`
;

var vertexShaderRotate = `
  in vec4 a_position;
  in vec2 texcoord;

  in mat4 Pmatrix;
  in mat4 Vmatrix;
  in mat4 Mmatrix;
  
  out vec2 v_texcoord;

  void main() {
    gl_Position = Pmatrix*Vmatrix*Mmatrix*vec4(a_position, 1.);
    v_texcoord = a_texcoord;
  }
`



var fragmentShaderSource = `#version 300 es
precision mediump float;

in vec2 v_texcoord;

uniform sampler2D u_texture;

out vec4 outColor;

void main() {
   outColor = texture(u_texture, v_texcoord);
}
`;

function loadShader(gl, shaderSource, shaderType) {
  var shader = gl.createShader(shaderType);

  gl.shaderSource(shader, shaderSource);

  gl.compileShader(shader);

  return shader;
}

function loadProgram(gl) {
  var program = gl.createProgram();

  var shader = loadShader(gl, fragmentShaderSource, gl.FRAGMENT_SHADER);
  gl.attachShader(program, shader);

  if(to_translate){
    shader = loadShader(gl, vertexShaderTranslate, gl.VERTEX_SHADER);
  }
  else{
    shader = loadShader(gl, vertexShaderSource, gl.VERTEX_SHADER);
  }
    gl.attachShader(program, shader);

  gl.linkProgram(program);

  return program;
}

function main(to_translate, to_rotate, to_scale, to_shear) {
  var canvas = document.getElementById("canvas");
  var gl = canvas.getContext("webgl2");

  if (!gl) {
    return;
  }

  var program = loadProgram(gl);

  var positionLocation = gl.getAttribLocation(program, "a_position");
  var texcoordLocation = gl.getAttribLocation(program, "a_texcoord");
  var textureLocation = gl.getUniformLocation(program, "u_texture");

  //create matrixes
  var Pmatrix = gl.getUniformLocation(program, "Pmatrix");
  var Vmatrix = gl.getUniformLocation(program, "Vmatrix");
  var Mmatrix = gl.getUniformLocation(program, "Mmatrix");

  var vao = gl.createVertexArray();

  gl.bindVertexArray(vao);

  var positions = [
    0, 0,
    0, 1,
    1, 0,
    1, 0,
    0, 1,
    1, 1,
  ];
  var positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  gl.enableVertexAttribArray(positionLocation);


  gl.vertexAttribPointer(
      positionLocation, 2, gl.FLOAT, false, 0, 0);

  var texcoords = [
    0, 0,
    0, 1,
    1, 0,
    1, 0,
    0, 1,
    1, 1,
  ];
  var texcoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texcoords), gl.STATIC_DRAW);

  gl.enableVertexAttribArray(texcoordLocation);

  gl.vertexAttribPointer(
      texcoordLocation, 2, gl.FLOAT, true, 0, 0);

  


  function loadTexture(url) {
    var tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
                  new Uint8Array([0, 0, 255, 255]));

    var img = new Image();
    img.addEventListener('load', function() {
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      gl.generateMipmap(gl.TEXTURE_2D);
    });
    img.src = url;

    return tex;
  }

  var image = loadTexture('stone1.png');

  //rotating
  if (to_rotate){

  }

  //translation
  if(to_translate){
    var x = document.getElementById("x").value;
    var y = document.getElementById("y").value;
    console.log(x);
    console.log(y);
    var translation = gl.getUniformLocation(program, 'translation');
    gl.uniform4f(translation, x, y, 0, 0.0);
  }
  


  function draw() {
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.useProgram(program);

    //scaling
    if(to_scale){
      var x = document.getElementById("x").value;
      var y = document.getElementById("y").value;

      var formMatrix = new Float32Array([
          x, 0.0, 0.0, 0.0,
        0.0,   y, 0.0, 0,0,
        0.0, 0.0, 0.0 ,0.0,
        0.0, 0.0, 0.0, 0.0,

      ]);

      var u_formMatrix = gl.getUniformLocation(program, 'u_formMatrix');
      gl.uniformMatrix4fv(u_formMatrix, false, formMatrix);
    }

    gl.bindVertexArray(vao);

    gl.uniform1i(textureLocation, 0);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, image);

    gl.drawArrays(gl.TRIANGLES, 0, 6);

  }


  function render(time) {
    draw();
    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
  to_translate = false;

}

document.getElementById("translate").addEventListener("click", translate);
document.getElementById("rotate").addEventListener("click", rotate);
document.getElementById("scale").addEventListener("click", scale);
document.getElementById("shear").addEventListener("click", shear);

function translate(){
  main(true, false,false,false);
}

function rotate(){
  main(false, true, false, false);
}

function scale(){
  main(false, false, true, false);
}

function shear(){
  main(false, false, false, true);
}



main(false,false,false,false);

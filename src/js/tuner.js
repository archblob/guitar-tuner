/* 
 * Since we are interested only in guitar tuning we don't bother
 * with anything higher than E6, even that is way to high, but i
 * thought that we can at least cover 24 frets.
 */

frequencies = [
  [41.20,"E1"],   [43.65,"F1"],
  [46.25,"F#1"],  [ 49.00,"G1"],
  [51.91,"G#1"],  [55.00,"A1"],
  [58.27,"A#1"],  [61.74,"B1"],
  [65.41,"C2"],   [69.30,"C#2"],
  [73.42,"D2"],   [77.78,"D#2"],
  [82.41,"E2"],   [87.31,"F2"],
  [92.50,"F#2"],  [98.00,"G2"],
  [103.83,"G#2"], [110.00,"A2"],
  [116.54,"A#2"], [123.47,"B2"],
  [130.81,"C3"],  [138.59,"C#3"],
  [146.83,"D3"],  [155.56,"D#3"],
  [164.81,"E3"],  [174.61,"F3"],
  [185.00,"F#3"], [196.00,"G3"],
  [207.65,"G#3"], [220.00,"A3"],
  [233.08,"A#3"], [246.94,"B3"],
  [261.63,"C4"],  [277.18,"C#4"],
  [293.66,"D4"],  [311.13,"D#4"],
  [329.63,"E4"],  [349.23,"F4"],
  [369.99,"F#4"], [392.00,"G4"],
  [415.30,"G#4"], [440.00,"A4"],
  [466.16,"A#4"], [493.88,"B4"],
  [523.25,"C5"],  [554.37,"C#5"],
  [587.33,"D5"],  [622.25,"D#5"],
  [659.26,"E5"],  [698.46,"F5"],
  [739.99,"F#5"], [783.99,"G5"],
  [830.61,"G#5"], [880.00,"A5"],
  [932.33,"A#5"], [987.77,"B5"],
  [1046.50,"C6"], [1108.73,"C#6"],
  [1174.66,"D6"], [1244.51,"D#6"],
  [1318.51,"E6"]
];

function Tuner(){
  this.frequencies = frequencies.map(this.fromFreqArray);
  this.sampleRate  = 44100;
  this.downsampleFactor = 8;
  this.fftSize = 8192;
};

Tuner.prototype.fromFreqArray = function(e,i,obj){
  var note = new Object();

  note.frequency = e[0];
  note.name      = e[1];

  return note;
};

Tuner.prototype.closestNote = function(freq){
  /* The note array is small enough to use
   * linear search.
   */
  var noteArray     = this.frequencies;
  var minDifference = Math.abs (noteArray[0].frequency - freq);
  var closestNote   = noteArray[0];
  
  for(n in this.frequencies){
    var currentDifference = Math.abs(noteArray[n].frequency - freq);
    
    if (currentDifference < minDifference){
      minDifference = currentDifference;
      closestNote   = noteArray[n];
    }
  }

  if (closestNote.frequency > freq){
    return { "note" : closestNote, "comp" : "LT"};
  } else if (closestNote.frequency < freq){
    return { "note" : closestNote, "comp" : "GT"};
  } else {
    return { "note" : closestNote, "comp" : "EQ"};
  }
};

Tuner.prototype.hps = function(spectrum, opt_harmonics){
  var peek = 1;
  
  for(var i=1; i < (spectrum.length/opt_harmonics); i++){
    for(var j = 1; j < opt_harmonics; j++){
      spectrum[i] *= spectrum[i*j];
    }
    
    if (spectrum[i] > spectrum[peek]){
      peek = i;
    }
  }
  
  return peek;
};

Tuner.prototype.run = function(stream) {
  var context = new AudioContext();

  var source = context.createMediaStreamSource(stream);
  var lowpass = context.createBiquadFilter();
  var highpass = context.createBiquadFilter();

  lowpass.type = "lowpass";
  /* slightly above E6 */
  lowpass.frequency = 1320;
  highpass.type = "highpass";
  /* slightly below E1 */
  highpass.frequency = 35;

  source.connect(lowpass);
  lowpass.connect(highpass);
  highpass.connect(context.destination);
};
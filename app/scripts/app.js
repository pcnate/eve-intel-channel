
angular.module('intelApp', ['ngRoute','angularMoment','xc.indexedDB']);

/**
 * @description
 */
angular.module('intelApp').config( function( $routeProvider ) {
  $routeProvider
    .when('/', {
      templateUrl: 'pages/main/page.html'
    })
    .when('/settings', {
      templateUrl: 'pages/settings/page.html'
    });
});

/**
 * @description
 */
angular.module('intelApp').controller('MainController', function( $scope, ReadFileFactory, $interval, $log ) {
  var mainCtrl = this;
  if( $log ) {
    //
  }

  $interval( function() {
    mainCtrl.glob = ReadFileFactory.returnDataObject();
  }, 1000 );

});

/**
 * @description
 */
angular.module('intelApp').factory('ReadFileFactory', function( moment, $log ) {

  var service = {};


  var availableSounds = [
    {
      name: 'A_Tone',
      url: 'assets/sounds/A_Tone-His_Self-1266414414.mp3',
    },
    {
      name: 'Beep_Ping',
      url: 'assets/sounds/Beep_Ping-SoundBible.com-217088958.mp3',
    },
    {
      name: 'Beep',
      url: 'assets/sounds/Beep-SoundBible.com-923660219.mp3',
    },
    {
      name: 'Bleep',
      url: 'assets/sounds/Bleep-SoundBible.com-1927126940.mp3',
    },
    {
      name: 'Censored_Beep',
      url: 'assets/sounds/Censored_Beep-Mastercard-569981218.mp3',
    },
    {
      name: 'Computer_Error_Alert',
      url: 'assets/sounds/Computer_Error_Alert-SoundBible.com-783113881.mp3',
    },
    {
      name: 'Electronic_Chime',
      url: 'assets/sounds/Electronic_Chime-KevanGC-495939803.mp3',
    },
    {
      name: 'glass_ping',
      url: 'assets/sounds/glass_ping-Go445-1207030150.mp3',
    },
    {
      name: 'Music_Censor',
      url: 'assets/sounds/Music_Censor-SoundBible.com-818434396.mp3',
    },
    {
      name: 'Robot_blip_2',
      url: 'assets/sounds/Robot_blip_2-Marianne_Gagnon-299056732.mp3',
    },
    {
      name: 'Robot_blip',
      url: 'assets/sounds/Robot_blip-Marianne_Gagnon-120342607.mp3',
    },
  ];

  var sounds = {};

  sounds.watchedSound = new Audio(availableSounds[0].url);
  sounds.myNameSound = new Audio(availableSounds[1].url);

  var dataObject = {
    lineNumber: 0,
    lines: [],
    motd: '',
    fileName: '',
    lastReadLine: 0,
    channelName: '',
    channelID: '',
    listener: '',
    sessionStart: '',
    watchedSystems: ['TD-4XL','NBO-O0','13-49W','R-RMDH','5-AOPX','CLW-SI','SH-YZY','O7-RFZ','Z-EKCY','QZX-L9','SG-3HY','AU2V-J','D-6PKO','SY-0AM','J103217'],
  };

  service.returnDataObject = function() {
    return dataObject;
  };

  const fs = require('fs');

  const logFolder = '/home/pcnate/Documents/EVE/logs/Chatlogs/';

  var channels = ['The Drone Den'];
  // var channels = ['Corp'];
  // var channels = ['DRONE PALS'];


  // var newestFiles = {};


  var lastMessage = '';

  service.loadNewestFile = function( channel, files ) {
    var path = logFolder;
    var out = [];
    files.forEach(function(file) {
      var stats = fs.statSync(path + '/' +file);
      if(stats.isFile()) {
        out.push({'file':file, 'mtime': stats.mtime.getTime()});
      }
    });
    out.sort(function(a,b) {
      return b.mtime - a.mtime;
    });
    return (out.length>0) ? out[0].file : '';
  };

  /**
   * @description process the contents of the file into the channel object
   */
  service.processContents = function( channel, contents ) {

    var channelArray = contents.split('\n');
    // var channelObject = {};

    // dataObject.lines = [];
    angular.forEach( channelArray, function( line, index ) {
      if( line.length > 0 && index > dataObject.lineNumber ) {
        dataObject.lineNumber = index;
        // $log.log( line );
        const regex = /\[\s(\d{4}\.\d{2}\.\d{2}\s\d{2}:\d{2}:\d{2})\s\]\s(.*?)\s\>\s(.*)/g;
        var m = regex.exec( line );
        if( m === null ) {
          var fileHeaderRegex, mm;

          fileHeaderRegex = /Channel Name:\s+(.*)/g;
          mm = fileHeaderRegex.exec( line );
          if( mm !== null ) {
            dataObject.channelName  = mm['1'];
          }

          fileHeaderRegex = /Channel ID:\s+-(\d+)/g;
          mm = fileHeaderRegex.exec( line );
          if( mm !== null ) {
            dataObject.channelID    = mm['1'];
          }

          fileHeaderRegex = /Listener:\s+(.*)/g;
          mm = fileHeaderRegex.exec( line );
          if( mm !== null ) {
            dataObject.listener     = mm['1'];
          }

          fileHeaderRegex = /Session started:\s+(.*)/g;
          mm = fileHeaderRegex.exec( line );
          if( mm !== null ) {
            dataObject.sessionStart = mm['1'];
          }

        } else
        if( m['2'] === 'EVE System' ) {
          dataObject.motd = m['3'];
        } else {

          var atme = m['3'].indexOf( dataObject.listener ) > -1;
          var date = moment( m['1']+' +00:00', 'YYYY.MM.DD HH:mm:ss ZZ' );
          var watched = false;

          angular.forEach( dataObject.watchedSystems, function( system ) {
            watched = m['3'].indexOf( system ) > -1 ? true : watched;
          });

          if( moment().diff( date, 'minutes' ) < 5 ) {
            if( watched )
              sounds.watchedSound.play();
            if( atme )
              sounds.myNameSound.play();
          }

          dataObject.lines.push({
            'date':       date,
            'character':  m['2'],
            'message':    m['3'],
            'atme':       atme,
            'lineNumber': index,
            'watchedSystem': watched,
          });
        }
      }
    });

    //
    var newestMessage = channelArray[channelArray.length-2];
    if( lastMessage != newestMessage ) {
      // $log.info( newestMessage );
      lastMessage = newestMessage;
    }

  };

  /**
   * convert little endian buffers to big endian buffers
   */
  service.swapBytes = function( buffer ) {
    var l = buffer.length;
    if (l & 0x01) {
      throw new Error('Buffer length must be even');
    }
    for (var i = 0; i < l; i += 2) {
      var a = buffer[i];
      buffer[i] = buffer[i+1];
      buffer[i+1] = a;
    }
    return buffer;
  };

  /**
   * @description process the selected file for the selected channel
   */
  service.processFile = function( channel, file ) {
    var filePath = logFolder + file;

    fs.readFile( filePath, 'ucs2', function( err, contents ) {
      if( !err ) {
        if( dataObject.fileName != file ) {
          dataObject.fileName = file;
          dataObject.lineNumber = 0;
        }
        service.processContents( channel, contents );
      }
    });

  };


  service.readFiles = function() {
    // var t = getNewestFile2( logFolder, new RegExp( channel + '.*\.txt' ) )

    fs.readdir(logFolder, function(err, f) {
      // var files = [];
      channels.forEach(function( channel ) {

        var channelFiles = [];

        f.forEach(function( file ) {

          if( file.includes( channel ) ) {
            channelFiles.push( file );
          }

        });

        service.processFile( channel, service.loadNewestFile( channel, channelFiles ) );

      });

    });

  };

  setInterval( function() {
    service.readFiles();
  }, 5000 );

  return service;

});

angular.module('intelApp').factory('SettingsFactory', function() {

});


angular.module('intelApp').directive('playSound', function() {
  return {

  };
});

angular.module('intelApp').filter('messageAge', function( moment ) {
  return function( input, age ) {

    if( angular.isUndefined( input ) || input.length < 1 ) {
      return [];
    }

    var resultSet = [];

    angular.forEach( input, function( line ) {
      if( moment().diff( line.date, 'minutes' ) < age ) {
        resultSet.push( line );
      }
    });
    return resultSet;
  };
});

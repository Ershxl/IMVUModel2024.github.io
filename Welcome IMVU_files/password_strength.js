(function () {
    'use strict';
    function bootstrap(imports) {
        var password_max_length = 40;
        var password_min_length = 8; // defined in 'import/password_strength.php' line 61.
        function password_strength(password, username) {
            password = password.trim();
            var BLACKLIST= [
                '12345678',
                '11111111',
                '1q2w3e4r',
                'access14',
                'anthony',
                'asdfasdf',
                'asshole',
                'baseball',
                'benjamin',
                'bigdaddy',
                'blahblah',
                'blessed',
                'blessing',
                'blink182',
                'bubbles',
                'butthead',
                'charlie',
                'chelsea',
                'chicken',
                'cocacola',
                'computer',
                'corvette',
                'creative',
                'danielle',
                'destiny',
                'diamond',
                'digital',
                'dolphins',
                'einstein',
                'emmanuel',
                'firebird',
                'football',
                'football1',
                'forever',
                'freedom',
                'friends',
                'fuckoff',
                'fuckyou',
                'fuckyou1',
                'gateway',
                'genesis',
                'hardcore',
                'ilovegod',
                'iloveyou',
                'iloveyou!',
                'iloveyou1',
                'iloveyou2',
                'internet',
                'jasmine',
                'jennifer',
                'jessica',
                'john316',
                'jordan23',
                'letmein',
                'looking',
                'marlboro',
                'matthew',
                'maverick',
                'maxwell',
                'mercedes',
                'michael',
                'michelle',
                'microsoft',
                'midnight',
                'mistress',
                'mountain',
                'mustang',
                'myspace1',
                'nicholas',
                'nintendo',
                'nothing',
                'onelove',
                'passw0rd',
                'password',
                'password1',
                'password12',
                'password123',
                'peaches',
                'pokemon',
                'princess',
                'qwerty1',
                'qwertyui',
                'rainbow',
                'redskins',
                'redwings',
                'richard',
                'rush2112',
                'samantha',
                'scooter',
                'scorpion',
                'soccer1',
                'srinivas',
                'startrek',
                'starwars',
                'steelers',
                'sunshine',
                'superman',
                'swimming',
                'testing',
                'testtest',
                'thunder',
                'trinity',
                'trustno1',
                'victoria',
                'victory',
                'welcome',
                'whatever',
                'william',
                'xxxxxxxx',
                'zxcvbnm',
            ];

            var passwordLower = password.toLowerCase();

            switch (true) {
                case password.length < password_min_length ||
                     password.length > password_max_length ||
                     password == username ||
                     (_.indexOf(BLACKLIST, passwordLower) != -1):
                    return 'weak';
                case /^[a-z]*$/.test(password) ||
                     /^[A-Z]*$/.test(password) ||
                     /^[0-9]*$/.test(password) ||
                     (username.length > 0 && password.indexOf(username) != -1):
                    return 'fair';
                case /^[a-zA-Z0-9]*$/.test(password):
                    return  'good';
                default:
                    return 'strong';
            }
        }
        return {
            passwordStrength : password_strength,
            passwordMaxLength : password_max_length,
            passwordMinLength : password_min_length,
        };
    }

    var imports = bootstrap({});
    window.password_strength = imports.passwordStrength;
    window.password_max_length = imports.passwordMaxLength;
    window.password_min_length = imports.passwordMinLength;
}());

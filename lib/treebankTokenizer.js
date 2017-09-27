/**
 * Author: Titus Wormer <tituswormer@gmail.com>
 * URL: http://wooorm.com/penn-treebank-tokenizer-in-javascript.html
 *
 * The Treebank tokenizer uses regular expressions to tokenize text as in
 * Penn Treebank.  This implementation is a based on both the Sed script
 * written by Robert McIntyre (available at
 * [http://www.cis.upenn.edu/~treebank/tokenizer.sed]), and the Python port
 * by Edward Loper and Michael Heilman (available at
 * [http://nltk.org/_modules/nltk/tokenize/treebank.html]).
 *
 * This method assumes that the text has already been segmented into
 * sentences.
 *
 * This tokenizer performs the following steps:
 *
 * 1. Split standard contractions, e.g. `don't` => `do n't`, and
 *    `they'll` => `they 'll`;
 * 2. Treat most punctuation characters as separate tokens;
 * 3. Split off commas and single quotes, when followed by whitespace;
 * 4. Separate periods that appear at the end of line.
 *
 * NOTE: Most of the tokenization is documented (a description of what is
 *       happening), and almost all expressions come with an example. These
 *       examples are given as follows:
 *
 *           "{input}" => "{output}"
 *
 *       Where `input` refers to the value given to the function, and `output`
 *       refers to the contents of `value` JUST AFTER the expression is
 *       evaluated.
 *
 *
 * == MODIFICATIONS ===========================================================
 *
 * - An array is returned instead of a string (by splitting on space
 *   characters);
 * - A while loop is used to break up the contractions not matched by general
 *   regular expressions, and these expressions are made case insensitive
 *   (where the Sed script only sometimes allows the starting letter to be
 *   uppercase).
 *
 *
 * == EXAMPLES ================================================================
 * => treebankTokenizer("Good muffins cost $3.88 in New York")
 * <= ["Good", "muffins", "cost", "$", "3.88", "in", "New", "York"]
 *
 * => treebankTokenizer("Please buy me two of them, thanks.")
 * <= ["Please", "buy", "me", "two", "of", "them,", "thanks", "."]
 *
 * => treebankTokenizer("I've had a number of interesting conversations")
 * <= ["I", "'ve", "had", "a", "number", "of", "interesting", "conversations"]
 *
 * => treebankTokenizer("He's an ex--Intel engineer")
 * <= ["He", "'s", "an", "ex", "--", "Intel", "engineer"]
 *
 */

treebankTokenizer = ( function () {

    // List of contractions adapted from Robert MacIntyre's tokenizer.
    var CONTRACTIONS = [
        /\b(can)(not)\b/i,
        /\b(d)('ye)\b/i,
        /\b(gim)(me)\b/i,
        /\b(gon)(na)\b/i,
        /\b(got)(ta)\b/i,
        /\b(lem)(me)\b/i,
        /\b(more)('n)\b/i,
        /\b(wan)(na) /i,
        /\ ('t)(is)\b/i,
        /\ ('t)(was)\b/i
    ];

    return {
      tokenize: function ( text ) {

        var iterator, length;

        // value = value
        // == STARTING QUOTES =============================================
        // Attempt to get correct directional quotes.

        // Replace quotes at the sentence start position, with double
        // ticks.
        // '"Sure", he said.' => '``Sure", he said.'
        text = text.replace( /^\"/, '``' )
        // When a single quote appears just after the previously inserted
        // double ticks, replace it with a space character.
        // "\"'Good morning, Dave,' said Hal \" recalled Frank." =>
        // "`` Good morning, Dave,' said Hal \" recalled Frank."
        // .replace( /(``)'/, '$1 ' )

        // Wrap spaces around a double quote preceded by opening brackets.
        // '<> denotes an inequation ("not equal to")' =>
        // '<> denotes an inequation ( `` not equal to")'
        text = text.replace( /([ (\[{<])"/g, '$1 `` ' )

        // == PUNCTUATION =================================================
        // Wrap spaces around an ellipsis (not the unicode character, but
        // three actual full stops).
        // 'She is secure, but he is...' => 'She is secure, but he is ... '
        text = text.replace( /\.\.\./g, ' ... ' )

        // Wrap spaces around some punctuation signs (semicolon, at sign,
        // hash sign, dollar, percent, and ampersand).
        // 'AT&T' => 'AT & T'
        text = text.replace( /[;@#$%&]/g, ' $& ' )

        // Wrap spaces around a full-stop and zero or more closing brackets
        // (or quotes), WHEN NOT preceded by a full-stop and WHEN followed
        // by the end of the string.
        // Here we assume sentence tokenization has been done first, so we
        // only split final periods.
        // '<> denotes an inequation ("not equal to.")' =>
        // '<> denotes an inequation ( `` not equal to .") '
        text = text.replace( /([^\.])(\.)([\]\)}>"\']*)\s*$/g, '$1 $2$3 ' )

        // However, we may as well split ALL question marks and exclamation
        // points.  We wrap spaces around exclamation and question marks.
        // 'Wait, what?' =>  'Wait, what ? '
        text = text.replace( /[?!]/g, ' $& ' )

        // == PARENTHESES, BRACKETS, ETC. =================================
        // Wrap closing and opening brackets in spaces.
        // '<> denotes an inequation ("not equal to")' =>
        // ' <  >  denotes an inequation  (  `` not equal to" ) '
        text = text.replace( /[\]\[\(\)\{\}<>]/g, ' $& ' )

        // Wrap two dashes (hyphen-minus characters) in spaces.
        // 'The years 2001--2003' => 'The years 2001 -- 2003'
        text = text.replace( /--/g, ' -- ' )

        // NOTE THAT SPLIT WORDS ARE NOT MARKED.  Obviously this isn't
        // great, since you might someday want to know how the words
        // originally fit together -- but it's too late to make a better
        //  system now, given themillions of words we've already done
        // "wrong".

        // First off, add a space to the beginning and end of each line, to
        // reduce necessary number of regular expressions.
        // 'Alright' => ' Alright '
        text =    ( ' ' + text + ' ' )

        // == ENDING QUOTES ===============================================

        // Replace remaining double quotes with double single quotes
        // wrapped in spaces.
        // '"Sure", he said' => ' ``Sure \'\' , he said '
        text = text.replace( /"/g, ' \'\' ' )

        // Wrap possessive or closing single quotes: A single quote (not
        // preceded by another single quote) followed by a space.
        // "'Surely'" => " 'Surely ' "
        text = text.replace( /([^'])' /g, '$1 \' ' )


        // == CONTRACTIONS ================================================

        // Add a space before a single quote followed by `s`, `m`, or `d`
        // (case-insensitive) and a space.
        // "It's awesome" => " It 's awesome "
        text = text.replace( /'([sSmMdD]) /g, ' \'$1 ' )

        // Add a space before occurances of `'ll`, `'re`, `'ve`, or `n't`
        // (or their uppercase variants).
        text = text.replace( /('ll|'LL|'re|'RE|'ve|'VE|n't|N'T) /g, ' $1 ' )

        iterator = -1;
        length = CONTRACTIONS.length;

        // Break up other contractions (not matched by general regular
        // expressions) with a space and wrap in spaces.
        // "Really, I cannot." => " Really, I  can not  .  "
        while ( iterator++ < length ) {
            text = text.replace( CONTRACTIONS[ iterator ], ' $1 $2 ' );
        }

        // Concatenate double (or more) spaces.
        text = text.replace( /\ \ +/g, ' ' )

        // Remove starting and ending spaces.
        text = text.replace( /^\ |\ $/g, '' )

        // Finally, we return the value, split on spaces, as an array.
        return text.split( ' ' );
    }
  }
}());

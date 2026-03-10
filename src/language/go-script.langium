grammar GoScript

entry Program:
    (statements+=Statement)*;

Statement:
    PrintStatement | VariableDeclaration;

PrintStatement:
    'print' '(' value=Expression ')';

VariableDeclaration:
    'let' name=ID '=' value=Expression;

Expression:
    StringLiteral | NumberLiteral | VariableReference;

StringLiteral:
    value=STRING;

NumberLiteral:
    value=NUMBER;

VariableReference:
    variable=[VariableDeclaration:ID];

hidden terminal WS: /\s+/;
terminal ID: /[_a-zA-Z][\w]*/;
terminal STRING: /"[^"]*"/;
terminal NUMBER: /[0-9]+(\.[0-9]+)?/;

hidden terminal SL_COMMENT: /\/\/[^\n\r]*/;

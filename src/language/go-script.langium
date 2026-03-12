grammar GoScript

// ============ 程序入口 ============
entry Program:
    packageClause=PackageClause?
    (imports+=ImportDeclaration)*
    (declarations+=TopLevelDeclaration)*;

PackageClause:
    'package' name=ID;

ImportDeclaration:
    'import' (importSpec=ImportSpec)? path=STRING;

ImportSpec:
    '{' (items+=ImportItem (',' items+=ImportItem)*)? '}' |
    alias=ID;

ImportItem:
    name=ID ('as' alias=ID)?;

// ============ 顶层声明 ============
TopLevelDeclaration:
    FunctionDeclaration |
    ClassDeclaration |
    InterfaceDeclaration |
    TypeDeclaration |
    EnumDeclaration |
    ExtensionMethodDeclaration;

// ============ 函数 ============
FunctionDeclaration:
    'fun' name=ID (typeParams=TypeParameterList)? '(' (params+=Parameter (',' params+=Parameter)*)? ')'
    (returnType=ReturnType)?
    ('=' body=Expression | block=Block);

ReturnType:
    '->' ('!' (type=TypeRef)? | type=TypeRef);

Parameter:
    (modifier='private')? name=ID type=TypeRef? ('=' default=Expression)? |
    '...' name=ID type=TypeRef?;

TypeParameterList:
    '<' (params+=TypeParameter (',' params+=TypeParameter)*)? '>';

TypeParameter:
    name=ID (constraint=TypeRef)?;

// ============ 类 ============
ClassDeclaration:
    'class' name=ID (primaryConstructor=PrimaryConstructor)? (superTypes=SuperTypeList)? classBody=ClassBody?;

PrimaryConstructor:
    '(' (members+=ConstructorParameter (',' members+=ConstructorParameter)*)? ')';

ConstructorParameter:
    (modifier='private')? (name=ID | embeddedType=TypeRef) (type=TypeRef)? ('=' default=Expression)?;

SuperTypeList:
    ':' (types+=TypeRef (',' types+=TypeRef)*);

ClassBody:
    '{' (members+=ClassMember)* '}';

ClassMember:
    ConstructorDeclaration |
    InitBlock |
    FieldDeclaration |
    MethodDeclaration;

ConstructorDeclaration:
    'constructor' '(' (params+=Parameter (',' params+=Parameter)*)? ')' block=Block;

InitBlock:
    'init' block=Block;

FieldDeclaration:
    ('val' | modifier='private')? name=ID type=TypeRef ('=' init=Expression)?;

MethodDeclaration:
    'fun' name=ID (typeParams=TypeParameterList)? '(' (params+=Parameter (',' params+=Parameter)*)? ')'
    (returnType=ReturnType)? ('=' body=Expression | block=Block);

// ============ 接口 ============
InterfaceDeclaration:
    'interface' name=ID (typeParams=TypeParameterList)? (superTypes=SuperTypeList)? '{' (members+=InterfaceMember)* '}';

InterfaceMember:
    MethodSignature;

MethodSignature:
    'fun' name=ID '(' (params+=Parameter (',' params+=Parameter)*)? ')' (returnType=ReturnType)?;

// ============ 类型定义 ============
TypeDeclaration:
    'type' name=ID (typeParams=TypeParameterList)? '=' type=TypeRef;

// ============ 枚举 ============
EnumDeclaration:
    'enum' name=ID '{' (members+=ID)* '}';

// ============ 扩展方法 ============
ExtensionMethodDeclaration:
    'fun' receiver=TypeRef '.' name=ID (typeParams=TypeParameterList)? '(' (params+=Parameter (',' params+=Parameter)*)? ')'
    (returnType=ReturnType)? ('=' body=Expression | block=Block);

// ============ 类型 ============
TypeRef:
    TypeRefUnion;

TypeRefUnion:
    TypeRefIntersection ('|' right=TypeRefIntersection)?;

TypeRefIntersection:
    TypeRefPrimary ('&' right=TypeRefPrimary)?;

TypeRefPrimary:
    baseType=NonArrayType (arrayDims+='[' ']')*;

NonArrayType:
    PredefinedType |
    MapType |
    FunctionType |
    StructType |
    QualifiedTypeRef |
    LiteralTypeRef |
    ParenthesizedTypeRef;

PredefinedType:
    ('Int' | 'Int8' | 'Int16' | 'Int32' | 'Int64' |
     'UInt' | 'UInt8' | 'UInt16' | 'UInt32' | 'UInt64' |
     'Float' | 'Float32' | 'Float64' |
     'Bool' | 'String' | 'Char' | 'Byte' | 'Any' | 'Never') nullable='?'?;

MapType:
    'Map' '<' keyType=TypeRef ',' valueType=TypeRef '>';

FunctionType:
    '(' (paramTypes+=TypeRef (',' paramTypes+=TypeRef)*)? ')' '->' ('!' (returnType=TypeRef)? | returnType=TypeRef?);

StructType:
    '{' (fields+=StructField (',' fields+=StructField)*)* '}';

StructField:
    name=ID type=TypeRef;

QualifiedTypeRef:
    name=ID (typeArgs=TypeArgumentList)? (nullable='?')? |
    name=ID (typeArgs=TypeArgumentList)? '.' tail=QualifiedTypeRef;

TypeArgumentList:
    '<' (args+=TypeRef (',' args+=TypeRef)*)? '>';

LiteralTypeRef:
    value=STRING;

ParenthesizedTypeRef:
    '(' type=TypeRef ')';

// ============ 语句 ============
Statement:
    VariableDeclaration |
    AssignmentStatement |
    PrintStatement |
    IfStatement |
    ForStatement |
    WhenStatement |
    ReturnStatement |
    ThrowStatement |
    ExpressionStatement |
    GoStatement |
    DeferStatement |
    SelectStatement |
    BreakStatement |
    ContinueStatement |
    Block;

PrintStatement:
    'print' '(' value=Expression ')';

Block:
    '{' (statements+=Statement)* '}';

VariableDeclaration:
    ('let' | 'val') name=ID type=TypeRef? '=' value=Expression;

AssignmentStatement:
    assignable=PostfixExpression (op=AssignmentOperator value=Expression)?;

AssignmentOperator returns string:
    '=' | '+=' | '-=' | '*=' | '/=' | '%=';

IfStatement:
    'if' condition=Expression block=Block ('else' elseBranch=ElseBranch)?;

ElseBranch:
    'if' condition=Expression block=Block |
    block=Block;

ForStatement:
    Label? 'for' (forInClause=ForInClause | forCStyle=ForCStyle | forCondition=Expression)? block=Block;

Label:
    name=ID ':';

ForInClause:
    ('let'? index=ID (',' value=ID)? | value=ID) 'in' iterable=Expression;

ForCStyle:
    'let' initName=ID '=' initValue=Expression SEMICOLON condition=Expression SEMICOLON step=Expression;

WhenStatement:
    'when' (subject=Expression)? '{' (branches+=WhenBranch)+ '}';

WhenBranch:
    (conditions+=WhenCondition (',' conditions+=WhenCondition)*) '->' whenBody=WhenBranchBody;

WhenBranchBody:
    block=Block | expression=Expression;

WhenCondition:
    Expression |
    'else' |
    'is' type=TypeRef |
    'in' range=Expression;

ReturnStatement:
    'return' (value=Expression)?;

ThrowStatement:
    'throw' value=Expression;

ExpressionStatement:
    expression=Expression;

GoStatement:
    'go' block=Block;

DeferStatement:
    'defer' block=Block;

SelectStatement:
    'select' '{' (cases+=SelectCase)* '}';

SelectCase:
    'case' (receive=ReceiveCase | send=SendCase) '->' (block=Block | expression=Expression) |
    'default' '->' (block=Block | expression=Expression);

ReceiveCase:
    (name=ID '=')? '<-' channel=Expression;

SendCase:
    channel=Expression '<-' value=Expression;

BreakStatement:
    'break' (label=ID)?;

ContinueStatement:
    'continue' (label=ID)?;

// ============ 表达式（优先级从低到高） ============
Expression:
    AssignmentExpression |
    LambdaExpression;

AssignmentExpression:
    NullCoalescingExpression (op=AssignmentOperator value=AssignmentExpression)?;

NullCoalescingExpression:
    OrExpression ('??' right=NullCoalescingExpression)?;

OrExpression:
    AndExpression ('||' right=OrExpression)?;

AndExpression:
    EqualityExpression ('&&' right=EqualityExpression)?;

EqualityExpression:
    ComparisonExpression (('==' | '!=') right=ComparisonExpression)?;

ComparisonExpression:
    TypeCheckExpression (('<' | '<=' | '>' | '>=' | 'in') right=TypeCheckExpression)?;

TypeCheckExpression:
    BitwiseOrExpression typeCheck=TypeCheckSuffix?;

TypeCheckSuffix:
    ('is' | '!is') type=TypeRef;

BitwiseOrExpression:
    BitwiseXorExpression ('|' right=BitwiseOrExpression)?;

BitwiseXorExpression:
    BitwiseAndExpression ('^' right=BitwiseXorExpression)?;

BitwiseAndExpression:
    ShiftExpression ('&' right=BitwiseAndExpression)?;

ShiftExpression:
    AdditiveExpression (('<<' | '>>') right=ShiftExpression)?;

AdditiveExpression:
    MultiplicativeExpression (('+' | '-') right=AdditiveExpression)?;

MultiplicativeExpression:
    UnaryExpression (('*' | '/' | '%') right=MultiplicativeExpression)?;

UnaryExpression:
    ('!' | '-' | 'try' | 'try!') operand=UnaryExpression |
    PostfixExpression;

PostfixExpression:
    PrimaryExpression (suffixes+=PostfixSuffix)*;

PostfixSuffix:
    '.' (member=ID | call=CallArguments) |
    '?' '.' (member=ID | call=CallArguments) |
    '!' |
    '++' | '--' |
    call=CallArguments |
    '[' index=Expression ']' |
    '..<' end=Expression |
    '..=' end=Expression |
    'catch' catchBlock=LambdaExpression;

PrimaryExpression:
    NumberLiteral |
    StringLiteral |
    RawStringLiteral |
    CharLiteral |
    BooleanLiteral |
    NullLiteral |
    StringInterpolation |
    ArrayLiteral |
    MapLiteral |
    ObjectExpression |
    ThisExpression |
    SuperExpression |
    IdentifierReference |
    ParenthesizedExpression |
    Block;

NumberLiteral:
    value=NUMBER;

StringLiteral:
    value=STRING;

RawStringLiteral:
    value=RAW_STRING;

CharLiteral:
    value=CHAR;

BooleanLiteral:
    value=('true' | 'false');

NullLiteral:
    value='null';

StringInterpolation:
    value=STRING;

ArrayLiteral:
    '[' (elements+=Expression (',' elements+=Expression)*)? ']';

MapLiteral:
    '#{' (entries+=MapEntry (',' entries+=MapEntry)*)? '}';

MapEntry:
    key=Expression ':' value=Expression;

ObjectExpression:
    'object' type=TypeRef (block=Block)?;

ThisExpression:
    'this' ('.' member=ID)?;

SuperExpression:
    'super' ('.' member=ID)?;

IdentifierReference:
    name=ID (typeArgs=TypeArgumentList)?;

ParenthesizedExpression:
    '(' (expression=Expression | destructuring=Destructuring) ')';

Destructuring:
    ObjectDestructuring | ArrayDestructuring;

ObjectDestructuring:
    '{' (props+=DestructuringProperty (',' props+=DestructuringProperty)*)? '}';

DestructuringProperty:
    (name=ID (alias=ID)?);

ArrayDestructuring:
    '[' (items+=DestructuringItem (',' items+=DestructuringItem)*)? ']';

DestructuringItem:
    name=ID |
    '...' name=ID;

CallArguments:
    '(' (args+=Argument (',' args+=Argument)*)? ')';

Argument:
    (name=ID ':')? value=Expression;

// ============ Lambda ============
LambdaExpression:
    '{' (params=LambdaParameters '->')? lambdaBody=LambdaBody '}';

LambdaBody:
    body=Expression |
    (statements+=Statement)*;

LambdaParameters:
    (params+=LambdaParameter (',' params+=LambdaParameter)*)?;

LambdaParameter:
    name=ID type=TypeRef?;

// ============ 终端符号 ============
hidden terminal WS: /\s+/;
hidden terminal SL_COMMENT: /\/\/[^\n\r]*/;
hidden terminal ML_COMMENT: /\/\*[\s\S]*?\*\//;

terminal ID: /[_a-zA-Z][\w]*/;
terminal NUMBER: /[0-9]+(\.[0-9]+)?([eE][+-]?[0-9]+)?/;
terminal STRING: /\"([^\"\\]|\\.|\$[a-zA-Z_][a-zA-Z0-9_]*|\$\{[^}]*\})*\"/;
terminal RAW_STRING: /`[^`]*`/;
terminal CHAR: /'([^'\\]|\\.)'/;
terminal SEMICOLON: ';';

grammar GoScriptGpt

hidden terminal WS: /\s+/;
hidden terminal DOC_COMMENT: /\/\*\*[\s\S]*?\*\//;
hidden terminal ML_COMMENT: /\/\*[\s\S]*?\*\//;
hidden terminal SL_COMMENT: /\/\/(?!go:)[^\n\r]*/;
terminal GO_DIRECTIVE: /\/\/go:[^\n\r]*/;

terminal ID: /[_\p{L}][_\p{L}\p{N}]*/;
terminal INT: /0|[1-9][0-9]*/;
terminal FLOAT: /[0-9]+\.[0-9]+([eE][+\-]?[0-9]+)?|[0-9]+[eE][+\-]?[0-9]+/;
terminal STRING: /"(\\.|[^"\\])*"/;
terminal RAW_STRING: /`[^`]*`/;
terminal CHAR: /'(\\.|[^'\\])'/;

entry Model:
    directives+=Directive*
    package=PackageDecl?
    imports+=ImportDecl*
    declarations+=TopLevelDeclaration*
;

Directive:
    value=GO_DIRECTIVE
;

PackageDecl:
    'package' name=QualifiedName
;

ImportDecl:
    'import' (alias=ID | spec=ImportSpec)? path=STRING
;

ImportSpec:
    '{' items+=ImportItem (',' items+=ImportItem)* ','? '}'
;

ImportItem:
    name=ID ('as' alias=ID)?
;

TopLevelDeclaration infers Declaration:
    VariableDecl
    | FunctionDecl
    | ClassDecl
    | InterfaceDecl
    | TypeAliasDecl
    | EnumDecl
;

Block:
    '{' statements+=Statement* '}'
;

Statement infers Statement:
    Block
    | VariableDecl
    | AssignmentOrExpressionStmt
    | IfStmt
    | ForStmt
    | WhenStmt
    | ReturnStmt
    | ThrowStmt
    | BreakStmt
    | ContinueStmt
    | DeferStmt
    | GoStmt
    | SelectStmt
    | LabelStmt
;

LabelStmt:
    label=ID ':' statement=Statement
;

AssignmentOrExpressionStmt:
    expression=Expression (
        ({infer AssignmentStmt.receiver=current} operator=('=' | '+=' | '-=' | '*=' | '/=' | '%=') value=Expression)
        | ({infer PostfixMutationStmt.target=current} operator=('++' | '--'))
    )?
;

VariableDecl infers Declaration:
    kind=('let' | 'val') pattern=BindingPattern type=TypeAnnotation? ('=' value=Expression)?
;

BindingPattern:
    IdentifierBinding
    | ObjectBinding
    | ArrayBinding
    | TupleBinding
;

IdentifierBinding:
    name=ID
;

ObjectBinding:
    '{' items+=ObjectBindingItem (',' items+=ObjectBindingItem)* ','? '}'
;

ObjectBindingItem:
    name=ID alias=ID?
;

ArrayBinding:
    '[' items+=ArrayBindingItem (',' items+=ArrayBindingItem)* ','? ']'
;

ArrayBindingItem:
    spread?='...' name=ID
;

TupleBinding:
    '(' items+=ID (',' items+=ID)* ','? ')'
;

IfStmt:
    'if' condition=Expression then=Block ('else' elseBranch=ElseBranch)?
;

ElseBranch:
    Block
    | IfStmt
;

ForStmt:
    'for' (
        each=ForEachClause
        | classic=ForClassicClause
        | condition=Expression
    )? body=Block
;

ForEachClause:
    bindings+=ID (',' bindings+=ID)? 'in' iterable=Expression
;

ForClassicClause:
    init=ForInit ';' condition=Expression? ';' update=ForUpdate?
;

ForInit:
    VariableDecl
    | AssignmentOrExpressionStmt
;

ForUpdate:
    AssignmentOrExpressionStmt
;

WhenStmt:
    'when' subject=Expression? '{' branches+=WhenBranch+ '}'
;

WhenBranch:
    ({infer WhenCaseBranch} tests+=WhenCondition (',' tests+=WhenCondition)* '->' body=ArrowBody)
    | ({infer WhenElseBranch} 'else' '->' body=ArrowBody)
;

WhenCondition:
    'in' range=Expression
    | 'is' type=TypeRef
    | literal=Expression
;

ArrowBody:
    Block
    | expression=Expression
;

ReturnStmt:
    'return' value=Expression?
;

ThrowStmt:
    'throw' value=Expression
;

BreakStmt:
    'break' label=[LabelStmt:ID]?
;

ContinueStmt:
    'continue' label=[LabelStmt:ID]?
;

DeferStmt:
    'defer' body=Block
;

GoStmt:
    'go' body=Block
;

SelectStmt:
    'select' '{' cases+=SelectCase* defaultCase=SelectDefaultCase? '}'
;

SelectCase:
    'case' channelCase=SelectChannelCase '->' body=ArrowBody
;

SelectChannelCase:
    name=ID '<-' channel=Expression
    | channel=Expression '<-' value=Expression
;

SelectDefaultCase:
    'default' '->' body=ArrowBody
;

FunctionDecl infers Declaration:
    'fun' receiver=ReceiverSpec? name=ID typeParameters=TypeParameters? '(' parameters=ParameterList? ')' returnType=FunctionReturn? (
        body=Block | '=' expr=Expression
    )
;

ReceiverSpec:
    target=TypeRef '.'
;

ParameterList:
    items+=Parameter (',' items+=Parameter)* ','?
;

Parameter:
    variadic?='...' name=ID type=TypeAnnotation ('=' defaultValue=Expression)?
;

FunctionReturn:
    '->' mayFail?='!' type=ReturnType?
    | '->' type=ReturnType
;

ReturnType:
    TypeRef | UnitType
;

ClassDecl infers Declaration:
    'class' name=ID typeParameters=TypeParameters? primary=PrimaryConstructor? body=ClassBody?
;

PrimaryConstructor:
    '(' fields+=ClassPrimaryField (',' fields+=ClassPrimaryField)* ','? ')'
;

ClassPrimaryField:
    visibility?='private' immutable?='val' name=ID type=TypeAnnotation
    | visibility?='private' name=ID type=TypeAnnotation
    | type=SimpleType
;

ClassBody:
    '{' members+=ClassMember* '}'
;

ClassMember:
    FieldDecl
    | ConstructorDecl
    | InitBlock
    | FunctionDecl
;

FieldDecl:
    visibility?='private' immutable?='val' name=ID type=TypeAnnotation ('=' value=Expression)?
    | visibility?='private' name=ID type=TypeAnnotation ('=' value=Expression)?
;

ConstructorDecl:
    'constructor' '(' parameters=ParameterList? ')' body=Block
;

InitBlock:
    'init' body=Block
;

InterfaceDecl infers Declaration:
    'interface' name=ID typeParameters=TypeParameters? supers=InterfaceSuperTypes? '{' members+=InterfaceMember* '}'
;

InterfaceSuperTypes:
    ':' types+=TypeRef (',' types+=TypeRef)*
;

InterfaceMember:
    name=ID typeParameters=TypeParameters? '(' parameters=ParameterList? ')' returnType=FunctionReturn?
;

TypeAliasDecl infers Declaration:
    'type' name=ID typeParameters=TypeParameters? '=' value=TypeExpression
;

EnumDecl infers Declaration:
    'enum' name=ID '{' members+=EnumMember* '}'
;

EnumMember:
    name=ID
;

Expression infers Expression:
    CatchExpression
;

CatchExpression infers Expression:
    ElvisExpression ({infer CatchExpr.left=current} 'catch' handler=LambdaExpr)?
;

ElvisExpression infers Expression:
    LogicalOrExpression ({infer BinaryExpr.left=current} operator='??' right=LogicalOrExpression)*
;

LogicalOrExpression infers Expression:
    LogicalAndExpression ({infer BinaryExpr.left=current} operator='||' right=LogicalAndExpression)*
;

LogicalAndExpression infers Expression:
    EqualityExpression ({infer BinaryExpr.left=current} operator='&&' right=EqualityExpression)*
;

EqualityExpression infers Expression:
    TypeCheckExpression ({infer BinaryExpr.left=current} operator=('==' | '!=') right=TypeCheckExpression)*
;

TypeCheckExpression infers Expression:
    ComparisonExpression (
        ({infer TypeCheckExpr.value=current} negated?='!' 'is' type=TypeRef)
        | ({infer TypeCheckExpr.value=current} 'is' type=TypeRef)
    )?
;

ComparisonExpression infers Expression:
    RangeExpression ({infer BinaryExpr.left=current} operator=('<' | '<=' | '>' | '>=') right=RangeExpression)*
;

RangeExpression infers Expression:
    AdditiveExpression ({infer BinaryExpr.left=current} operator=('..<' | '..=') right=AdditiveExpression)?
;

AdditiveExpression infers Expression:
    MultiplicativeExpression ({infer BinaryExpr.left=current} operator=('+' | '-' | '|' | '^') right=MultiplicativeExpression)*
;

MultiplicativeExpression infers Expression:
    PrefixExpression ({infer BinaryExpr.left=current} operator=('*' | '/' | '%' | '&' | '<<' | '>>') right=PrefixExpression)*
;

PrefixExpression infers Expression:
    ({infer PrefixExpr} operator=('!' | '-' | '+' | '<-') expression=PrefixExpression)
    | TryExpression
;

TryExpression infers Expression:
    ({infer TryExpr} operator=('try' | 'try!') expression=PostfixExpression)
    | PostfixExpression
;

PostfixExpression infers Expression:
    PrimaryExpression ({infer MemberChain.target=current} actions+=PostfixAction)*
;

PostfixAction:
    MemberAccess
    | OptionalMemberAccess
    | CallSuffix
    | IndexSuffix
    | NonNullAssert
    | PostfixIncrement
;

MemberAccess:
    '.' member=ID
;

OptionalMemberAccess:
    '?.' member=ID
;

CallSuffix:
    typeArguments=TypeArguments arguments=CallArguments trailingLambda=LambdaExpr?
    | typeArguments=TypeArguments trailingLambda=LambdaExpr
    | arguments=CallArguments trailingLambda=LambdaExpr?
    | trailingLambda=LambdaExpr
;

Argument:
    name=ID ':' value=Expression
    | value=Expression
;

IndexSuffix:
    '[' index=Expression ']'
;

NonNullAssert:
    '!'
;

PostfixIncrement:
    operator=('++' | '--')
;

PrimaryExpression infers Expression:
    Literal
    | ReferenceExpr
    | ParenthesizedExpr
    | IfExpr
    | WhenExpr
    | LambdaExpr
    | ObjectExpr
    | ArrayLiteral
    | MapLiteral
    | ConstructorLiteral
;

Literal infers Expression:
    NumberLiteral
    | StringLiteral
    | CharLiteral
    | BooleanLiteral
    | NullLiteral
    | ThisExpr
;

NumberLiteral:
    value=FLOAT | value=INT
;

StringLiteral:
    value=STRING | value=RAW_STRING
;

CharLiteral:
    value=CHAR
;

BooleanLiteral:
    value=('true' | 'false')
;

NullLiteral:
    'null'
;

ThisExpr:
    'this'
;

ReferenceExpr:
    target=QualifiedName
;

QualifiedName:
    ID ('.' ID)*
;

ParenthesizedExpr:
    '(' expression=Expression ')'
;

IfExpr:
    'if' condition=Expression then=Block 'else' elseBranch=Block
;

WhenExpr:
    'when' subject=Expression? '{' branches+=WhenBranch+ '}'
;

LambdaExpr:
    '{' signature=LambdaSignature? body+=Statement* expr=Expression? '}'
;

LambdaSignature:
    params+=LambdaParam (',' params+=LambdaParam)* '->'
    | '->'
;

LambdaParam:
    name=ID type=TypeAnnotation?
;

ObjectExpr:
    'object' type=TypeRef '{' members+=FunctionDecl* '}'
;

ArrayLiteral:
    '[' items+=Expression (',' items+=Expression)* ','? ']'
    | type=TypeRef '[]' arguments=CallArguments
;

MapLiteral:
    '#{' entries+=MapEntry (',' entries+=MapEntry)* ','? '}'
;

MapEntry:
    key=Expression ':' value=Expression
;

ConstructorLiteral:
    type=TypeRef arguments=CallArguments
;

CallArguments:
    '(' items+=Argument (',' items+=Argument)* ','? ')'
;

TypeExpression infers TypeRef:
    UnionType
;

TypeRef infers TypeRef:
    UnionType
;

UnionType infers TypeRef:
    IntersectionType ({infer UnionTypeRef.left=current} '|' right=IntersectionType)*
;

IntersectionType infers TypeRef:
    NullableType ({infer IntersectionTypeRef.left=current} '&' right=NullableType)*
;

NullableType infers TypeRef:
    PrimaryType ({infer NullableTypeRef.base=current} '?')*
;

PrimaryType infers TypeRef:
    FunctionType
    | ArrayType
    | ObjectType
    | LiteralType
    | SimpleType
    | UnitType
    | ParenthesizedType
;

SimpleType:
    name=QualifiedName typeArguments=TypeArguments?
;

TypeArguments:
    '<' items+=TypeRef (',' items+=TypeRef)* '>'
;

ArrayType:
    element=PrimaryArrayBase '[]'
;

PrimaryArrayBase infers TypeRef:
    SimpleType
    | LiteralType
    | UnitType
    | ParenthesizedType
    | ObjectType
;

FunctionType:
    '(' parameters=TypeList? ')' '->' mayFail?='!' returnType=ReturnType
    | '(' parameters=TypeList? ')' '->' returnType=ReturnType
;

TypeList:
    items+=TypeRef (',' items+=TypeRef)*
;

ObjectType:
    '{' fields+=ObjectTypeField ((','? fields+=ObjectTypeField))* ','? '}'
;

ObjectTypeField:
    name=ID type=TypeAnnotation
;

LiteralType:
    value=STRING
;

UnitType:
    '(' ')'
;

ParenthesizedType:
    '(' type=TypeRef ')'
;

TypeAnnotation:
    type=TypeRef
;

TypeParameters:
    '<' items+=TypeParameter (',' items+=TypeParameter)* '>'
;

TypeParameter:
    name=ID constraint=TypeRef?
;

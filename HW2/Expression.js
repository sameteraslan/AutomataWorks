var tok     //current Token
var tokens  //Token.list()
var bosluk = ' '
var sayac = -1;
function match(k) {
    if (tok.kind == k) 
        tok = tokens.pop();
    else expected(k);
}
function expected(s) {
    error(s+" expected -- "+tok+" found");
}
function error(s) {
    throw ("At index "+tok.index+": "+s);
}
function showError(elt) {
    try {
        elt.selectionStart = tok.index;
        elt.selectionEnd = tok.index + tok.length;
        elt.focus();     
    } catch (error) {
        console.log("showError metoduna hata geldi");
    }
    
}

class Func {
    constructor(f, num) {
        this.f = f;
        this.num = num;}
    fValue() { return eval("Math." + this.f + "(" + this.num + ")"); }
    toTree(val) { return bosluk.repeat(val) + this.f + " " + this.num+'\n'; }
    toPostfix() { return this.f + " " + this.num+' '; }
    toString() { return this.f + "(" + this.num.toString() + ")"; }
}

class Constant {
   constructor(num) { this.num = num; }
   fValue() { return this.num; }
   toTree(val) { return bosluk.repeat(val) + this.num+'\n'; }
   toPostfix() { return this.num+' '; }
   toString() { return this.num.toString(); }
}
class Binary {
   constructor(left, oper, right) {
      this.left = left; this.oper = oper; this.right = right;
   }
   fValue() {
      switch (this.oper) {
      case PLUS:  return this.left.fValue()+this.right.fValue();
      case MINUS: return this.left.fValue()-this.right.fValue();
      case STAR:  return this.left.fValue()*this.right.fValue();
      case MOD:   return this.left.fValue()%this.right.fValue();
      case SLASH: 
         let v = this.right.fValue();
         if (v == 0) 
            throw ("Division by zero");
         return this.left.fValue()/v;
      default: return NaN;
      }
   }
   toTree() {
   
      return  bosluk.repeat(++sayac)+this.oper+'\n'+this.left.toTree(sayac)+this.right.toTree(sayac--)
   }
   toPostfix() {
      return this.left.toPostfix()+this.right.toPostfix()+this.oper+' '
   }
   toString() {
      return '('+this.left + this.oper + this.right+')'
   }
}

function binary(e) {
    let op = tok.kind; match(op);
    return new Binary(e, op, term());
}
function expression() {
    let e = (tok.kind == MINUS)?
      binary(new Constant(0)) : term();
    while (tok.kind == PLUS || tok.kind == MINUS) 
      e = binary(e);
    return e;
}
function term() {
    let e = factor();
    while (tok.kind == MOD || tok.kind == STAR || tok.kind == SLASH) {
        let op = tok.kind; match(op);
        e = new Binary(e, op, factor());
    }
    return e;
}

function i(key, value) {
    // Burada gelen fonksiyonun Math sınıfında
    // olup olmadığı kontrolunu yaptım.
    // Eğer geçerli fonksiyonsa hesaplama yaptım -->> i(sin, 45) -> Math.sin(45) gibi..
    // Bu kısmı şimdilik paylaşmayacağım.
}
function factor() {
    let b = tok.value;
    switch (tok.kind)  {
    case NUMBER:
      let c = tok.val;
      match(NUMBER);
      return new Constant(c);
    case LEFT:
      match(LEFT); 
      let e = expression();
      match(RIGHT); return e;
    case IDENT:
        let as = tok.val;
        match(IDENT);
        match(LEFT);
        let iValue = i(as, expression());
        console.log(iValue);
        if (iValue == -1) error("HATA");
        match(RIGHT);
        return new Func(as, iValue[1]);

    default: expected("Factor");
    }
    

    return null;
}


class Db {

  constructor() {
    this.qb_select = [];
    this.qb_from;
    this.qb_where = [];
    this.qb_order_by = [];
    this.qb_group_by = [];
    this.qb_limit = 0;
    this.qb_offset = 0;
    this.qb_join = [];
    this.qb_con;

    //Debugging
    this.queries = [];
  }

  select(select){
    select = select.split(",");

    var i;
    for(i = 0; i < select.length; i++) {
      var val = select[i].trim();
      this.qb_select.push(val);
    }
  }

  from(from){
    this.qb_from = from;
  }

  _has_operator(str){
    return str.match(/(<|>|!|=|\sIS NULL|\sIS NOT NULL|\sEXISTS|\sBETWEEN|\sLIKE|\sIN\s*\(|\s)/i);
  }

  where(key, value){
    var where = "";

    if(this._has_operator(key)){
      where = key;
    }else{
      where = key + " = '" + value + "'";
    }

    this.qb_where.push(where);
  }

  where_in(key, value, not = false){
    not = (not) ? ' NOT' : '';

    var values = [];

    var i;
    for(i = 0; i < value.length; i++) {
      var val = '"' + value[i] + '"';
      values.push(val);
    }

    var where = key + not + " IN(" + values.join() + ")"; 
    this.qb_where.push(where);
  }

  order_by(value, type = "ASC"){
    var order_by = "";
    order_by = value + " " + type;

    this.qb_order_by.push(order_by);
  }

  group_by(value){
    this.qb_order_by.push(value);
  }

  limit(value, offset = 0){
    this.qb_limit = parseInt(value);

    if(offset){
      this.qb_offset = parseInt(offset);
    }
  }

  join(table, cond, type = ''){
    if(type !== ''){
      type = type.trim();
      type = type.toUpperCase(type);

      var types = ['LEFT', 'RIGHT', 'OUTER', 'INNER', 'LEFT OUTER', 'RIGHT OUTER'];
      if(types.indexOf(type) == -1){  
         type = '';
      }else{
        type += ' ';
      }

      // Assemble the JOIN statement
      var join = type + 'JOIN ' + table + ' ON ' + cond;
      this.qb_join.push(join);
    }
  }

  last_query(){
    sails.log("arr queries", this.queries);
    var arr = this.queries;
    return arr[arr.length - 1];
  }

  count_all_results(env){
    var $this = this;
    return new Promise(async function(resolve, reject){
      $this.qb_select = ["COUNT(*) as count"];
      var response = await $this.get(env);
      resolve(response[0].count);
    });
  }

  get(env){
    var $this = this;
    return new Promise(async function(resolve, reject) {
      var $sql = "SELECT ";

      /* --- Select --- */

      if(!$this.qb_select.length){
        $sql += "*";
      }else{
        $sql += $this.qb_select.join(', ');
      }

      /* --- From --- */

      $sql += "\nFROM " + $this.qb_from;

      /* --- Join --- */

      // Write the "JOIN" portion of the query
      if($this.qb_join.length){
        $sql += "\n" + $this.qb_join.join("\n");
      }

      /* --- Where --- */

      if($this.qb_where.length){
        var where = $this.qb_where.join(' AND ');
        where = where.replace(/AND\s*$/, "");
        $sql += "\nWHERE " + where;
      }

      /* -- Order by -- */
      if($this.qb_order_by.length){
        var order_by = $this.qb_order_by.join(',');
        $sql += "\nORDER BY " + order_by;
      }

      /* -- Group by -- */
      if($this.qb_group_by.length){
        var group_by = $this.qb_group_by.join(',');
        $sql += "\nGROUP BY " + group_by;
      }

      /* --- Limit --- */

      if($this.qb_limit > 0){
        $sql += "\nLIMIT " + ($this.qb_offset ? $this.qb_offset + ', ' : '') + $this.qb_limit;
      }

      console.log($sql);
      resolve($sql);
    });
  }
}

module.exports = Db;
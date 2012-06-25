// Generated by CoffeeScript 1.3.3
var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

define('hoodie/sharing/remote', ['hoodie/remote'], function(Remote) {
  return Remote = (function(_super) {

    __extends(Remote, _super);

    function Remote() {
      this._handle_push_success = __bind(this._handle_push_success, this);

      this.push = __bind(this.push, this);
      return Remote.__super__.constructor.apply(this, arguments);
    }

    Remote.prototype.push = function(docs) {
      var obj;
      if (!$.isArray(docs)) {
        docs = (function() {
          var _i, _len, _ref, _results;
          _ref = this.hoodie.store.changed_docs();
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            obj = _ref[_i];
            if (obj.id === this.hoodie.sharing.id || obj.$sharings && ~obj.$sharings.indexOf(this.hoodie.sharing.id)) {
              _results.push(obj);
            }
          }
          return _results;
        }).call(this);
      }
      return Remote.__super__.push.call(this, docs);
    };

    Remote.prototype._pull_url = function() {
      var since;
      since = this.hoodie.config.get('_remote.seq') || 0;
      if (this.active) {
        return "/" + (encodeURIComponent(this.hoodie.account.db())) + "/_changes?filter=%24sharing_" + this.hoodie.sharing.id + "/owned&include_docs=true&since=" + since + "&heartbeat=10000&feed=longpoll";
      } else {
        return "/" + (encodeURIComponent(this.hoodie.account.db())) + "/_changes?filter=%24sharing_" + this.hoodie.sharing.id + "/owned&include_docs=true&since=" + since;
      }
    };

    Remote.prototype._add_revision_to = function(obj) {
      var doc, key, _ref;
      if (obj.$docs_to_remove) {
        console.log("obj.$docs_to_remove");
        console.log(obj.$docs_to_remove);
        _ref = obj.$docs_to_remove;
        for (key in _ref) {
          doc = _ref[key];
          this._add_revision_to(doc);
        }
      }
      return Remote.__super__._add_revision_to.call(this, obj);
    };

    Remote.prototype._handle_push_success = function(docs, pushed_docs) {
      var _this = this;
      return function() {
        var doc, i, id, key, pushed_doc, type, update, _i, _j, _len, _len1, _ref, _ref1;
        for (_i = 0, _len = pushed_docs.length; _i < _len; _i++) {
          pushed_doc = pushed_docs[_i];
          if (pushed_doc.$docs_to_remove) {
            _ref = pushed_doc.$docs_to_remove;
            for (key in _ref) {
              doc = _ref[key];
              _ref1 = key.split(/\//), type = _ref1[0], id = _ref1[1];
              update = {
                _rev: doc._rev
              };
              for (i = _j = 0, _len1 = docs.length; _j < _len1; i = ++_j) {
                doc = docs[i];
                _this.hoodie.store.update(type, id, update, {
                  remote: true
                });
              }
            }
          }
        }
        return Remote.__super__._handle_push_success.call(_this, docs, pushed_docs)();
      };
    };

    return Remote;

  })(Remote);
});

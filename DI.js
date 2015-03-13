(function () {
  'use strict';

  module.exports = {

    modules: {},
    module: function (name, dependencies) {
      // If we dont specify dependencies, return if there is a
      // an existing module, else throw error
      if (dependencies === undefined) {
        var temp = this.modules[name.toString()];
        if (temp === undefined) {
          throw 'Module ' + name.toString() + ' is not available';
        } else {
          return temp;
        }
      }
      var fReg = {};
      // OUr register function here to add dependencies
      function register(rFName, rF) {
        this.fReg[rFName] = rF;
      }
      // The main inject function
      function inject(func) {
        var i;
        // Not the best regex game, got it from:
        // http://merrickchristensen.com/articles/javascript-dependency-injection.html
        var FN_ARGS = /^function\s*[^\(]*\(\s*([^\)]*)\)/m;
        // Turn the argument into a string
        var fString = func.toString();
        // Match it with regex and get its arguments
        var args = fString.match(FN_ARGS)[1];
        // Split using commas
        var argsArr = args.split(',');
        // Since some args might have extra spaces, delete them
        for (i=1; i<argsArr.length; i++) {
          var a = argsArr[i];
          a = a.substring(1);
          argsArr[i] = a;
        }
        // Declare this as self so that we can pass it
        var self = this;
        // If there is no dependencies & its empty
        // Just apply the function itself
        if (argsArr.length === 1 && argsArr[0] === '') {
          return function() {
            return func.apply(this,null);
          };
        }
        // Didnt write else here because if the if up ther is
        // taken it will simply return
        return function() {
          // Apply the arguments to the function
          return func.apply(self,self.getRegisteredFunc(argsArr));
        };
      }
      // Function to get registered functions using an array
      // of dependency names as a parameter
      var self = this;
      function getRegisteredFunc(fName) {
        var arr  = [];
        // We shall quasi-recirsively go for dependencies
        var dep = dependencies;
        // We will go until there is no next dependency
        while (dep.length !== 0) {
          // FOr each dependency
          for (var i=0; i<dep.length; i++) {
            // Get the corresponding module
            var dName = dep[i].toString();
            var moduleX = self.module(dName);
            // Push to function if needed
            for (var i=0; i<fName.length; i++) {
              var n = fName[i];
              arr.push(moduleX.fReg[n]);
            }
            // Go to next set of dependencies
            dep = moduleX.dependencies;
          };
        }
        // Erase errors from the prev alg
        for (var i=0; i<arr.length; i++) {
          if (arr[i] === undefined) {
            arr.splice(i,1);
          }
        }
        // Add stuff from this
        for (var i=0; i<fName.length; i++) {
          var n = fName[i];
          arr.push(fReg[n]);
        }
        // And return, we are done
        return arr;
      }
      // Return the methods
      this.modules[name] = {
        name: name,
        dependencies: dependencies,
        fReg: fReg,
        register: register,
        inject: inject,
        getRegisteredFunc: getRegisteredFunc
      };
      return this.modules[name];
    }
  };
})();

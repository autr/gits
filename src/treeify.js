// Extract a filename from a path
function getFilename(url) {
    return url.split("/").filter(function(value) {
        return value && value.length;
    }).reverse()[0];
}

// Find sub paths
function findSubPaths(url, paths) {
    // slashes need to be escaped when part of a regexp
    console.log('????', url, paths);
    var rePath = url.replace("/", "\\/");
    var re = new RegExp("^" + rePath + "[^\\/]*\\/?$");
    return paths.filter(function(i) {
        return i !== url && re.test(i);
    });
}

// Build tree recursively
function treeify(url, paths) {
    url = url || "";
    var nodeList = [];
    console.log('.....', url)
    const found = findSubPaths(url,paths)
    console.log('found', found);
    found.forEach(function(subPath) {
        var nodeName = getFilename(subPath);
        console.log('.each', nodeName, subPath)
        if (/\/$/.test(subPath)) {
            var node = {};
            node[nodeName] = treeify(subPath, paths);
            nodeList.push(node);
        } else {
            nodeList.push(nodeName);
        }
    });
    return nodeList;
}

// Build tree from root
module.exports = treeify;

// // By default, tree is an array
// // If it contains only one element which is an object, 
// // return this object instead to match OP request
// if (tree.length == 1 && (typeof tree[0] === 'object')) {
//     tree = tree[0];
// }

// // Serialize tree for debug purposes
// console.log(JSON.stringify(tree, null, 2));
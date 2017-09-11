db.metas.mapReduce(
	function() {
		var name = this.raw.FileType;
		emit(name, 1);
	},
	function(key, values) {
		var count = 0;
		values.forEach(function(v) {
			count +=v;
		});
		return count;
	},
	{
		query: {},
		out: "filetype_count"
	}
);
db.metas.mapReduce(
	function() {
		var name = this.properties.author || this.raw.Author || this.raw.Creator || this.raw["Initial-creator"] || null;
		if (Array.isArray(name))
			name = name[0];
		if (name)
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
		out: "author_count"
	}
);
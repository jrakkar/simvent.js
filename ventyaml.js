class ventyaml() {
	constructor(textarea) {
		if (! YAML){}
		this.textarea = document.getElementById(textarea);
		this.yaml = this.textarea.value;
		this.json = YAML.parse(this.yaml);
	}
}

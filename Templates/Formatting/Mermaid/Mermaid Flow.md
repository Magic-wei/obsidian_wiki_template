```mermaid
graph LR
	%%==============%%
	%% Declarations %%
	%%==============%%
		A[TOPIC]
			click A "obsidian://vault/INDEX" %% Use "\" for Windows
		B[Topic 1]	
			click B "obsidian://vault/Knowledge/Interests" "Open the link B"
		C[Topic 2]
			click C "obsidian://vault/Knowledge/Interests"
	%%=========%%
	%% Linking %%
	%%=========%%
	%% comment
	A --> B & C
	
	%% subgraph
	%% end
class A,B,C internal-link;
style A fill:#EBDBB2,stroke:#EEE,stroke-width:4px,color:#FFF
```

[mermaid live editor](https://mermaid-js.github.io/mermaid-live-editor/)
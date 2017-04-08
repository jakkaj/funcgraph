# Azure Function Graphic Visualiser
Azure Function Graphic Visualiser (Visualizer :P) is an Azure Site Extension to show the relationships between your functions.

[Site extension link](https://www.siteextensions.net/packages/funcgraph/1.0.1)

This work is based on a blog post by Mathias Brandewinder [http://brandewinder.com/2017/04/01/azure-function-app-diagram/](http://brandewinder.com/2017/04/01/azure-function-app-diagram/)

<img src="https://cloud.githubusercontent.com/assets/5225782/24825002/35c2318c-1c59-11e7-9c9c-155ce0e14267.png" width="720"/>

The big round nodes are functions, the sqaure ones are the inputs and outputs like triggers, queues and tables. The lines are labelled with the variable name.

Installation is easy - head to Kudu for your Function site and search for Function. Once it's installed you will need to hit ```Restart Site```.

<img src="https://cloud.githubusercontent.com/assets/5225782/24825321/06d0d174-1c60-11e7-812f-fe1d7d15f77c.JPG" width="720"/>

By default the system returns as SVG, but if you but ?format=png on the end of the url it will send you back a rendered PNG version. 


# Azure Function Graphic Visualiser
Azure Function  Visualiser (Visualizer :P) is an Azure Site Extension to show the relationships between your functions.

Installation is easy - head to the Kudu SCM for your Function site, click on Site Extensions, switch to gallery and search for "Function" and pick "Azure Function Graphic Visualiser". Once it's installed you will need to hit ```Restart Site```. Now you can visit yoursite.scm.azurewebsites.net/funcgraph and see your functions as a neat diagram!

**Please note: Site Extensions do not work with consumption based plans. You must have a paid App Service plan* 

[Site extension link](https://www.siteextensions.net/packages/funcgraph/1.0.1)

Azure Functions are an awesome way to create separate little microservices that each solve their own little part of a puzzle.

Functions can be triggered by a range of services such as a file write, a queue message or a http reuqest and in turn can send out messages to queues other services which will trigger more Functions.

As you add more and more services to your project it can become difficult to see how they work together - this project solves that by providing a single diagram of how your function is glued together. 

It installs as a Site Extension in to your Kudu site (yoursite.scm.azurewebsites.net - or click the go to Kudu option from your fuction settings in the Azure portal). 

Once installed, you can see your function graph at yoursite.scm.azurewebsites.net/funcgraph. 


<img src="https://cloud.githubusercontent.com/assets/5225782/24825002/35c2318c-1c59-11e7-9c9c-155ce0e14267.png" width="720"/>

The big round nodes are functions, the square ones are the inputs and outputs like triggers, queues and tables. The lines are labelled with the variable name.

<img src="https://cloud.githubusercontent.com/assets/5225782/24825321/06d0d174-1c60-11e7-812f-fe1d7d15f77c.JPG" width="720"/>

By default the system returns as SVG, but if you put ?format=png on the end of the url it will send you back a rendered PNG version. 

This work is based on a blog post by Mathias Brandewinder who had the idea to use GraphViz to visualise functions. [http://brandewinder.com/2017/04/01/azure-function-app-diagram/](http://brandewinder.com/2017/04/01/azure-function-app-diagram/). Big thanks Mathias!

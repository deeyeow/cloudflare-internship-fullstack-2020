//Cloudflare Workers Internship Application: Full-Stack 2020
/** 
* This JavaScript program randomly sends users to one of 
* two custom webpages. It also keeps track of returning
* visitors via cookies, showing them the same webpage they
* saw first.
* 
* @author  Darren Yau 
* @version 1.0 
* @since   2020-04-19 
*/

//initialize url, seed, cookie, and uniqueUsers global variables
let url = 'https://cfw-takehome.developers.workers.dev/api/variants';
let seed;
let cookie;
let uniqueUsers = new Map();

/**
 * The AttributeRewriter class rewrites an HTML 
 * element's attributes.
 */
class AttributeRewriter 
{
	/** 
     * Constructor for AttributeRewriter. 
     * @param id The id of the HTML element to change
	 * @param variant Which custom webpage to process 
     * @return None
     */
	constructor(id, variant) 
	{
		this.id = id;
		this.variant = variant;
	}
	
	/** 
     * Rewrites the given HTML element's attributes. 
     * @param element The HTML element to change 
     * @return None
     */
	element(element) 
	{	
		//process either first or second custom webpage
	  	if (this.variant == 0)
	  	{
			if (this.id == '') 
			{
				element.setInnerContent('HOLY PUPPER')
			}
			if (this.id == 'title')
			{
				element.setInnerContent('The Holy Pupper blesses you')
			}
			if (this.id == 'description')
			{
				element.setInnerContent('Clear cookies to test your luck again!')
			}
			if (this.id == 'url')
			{
				element.setAttribute('href','https://i.redd.it/2ych6bq9awwz.jpg');
				element.setInnerContent('Boop')
			}
		}
		else
		{
			if (this.id == '') 
			{
				element.setInnerContent('EVIL CATTO')
			}
			if (this.id == 'title')
			{
				element.setInnerContent('The Evil Catto spooks you')
			}
			if (this.id == 'description')
			{
				element.setInnerContent('Clear cookies to test your luck again!')
			}
			if (this.id == 'url')
			{
				element.setAttribute('href','https://i.kym-cdn.com/entries/icons/facebook/000/026/027/halfiecat.jpg');
				element.setInnerContent('Beep')
			}
		}
  	}
}

/** 
 * Registers a FetchEvent listener that sends a custom
 * response for the given request.
 */
addEventListener('fetch', event => 
{
	event.respondWith(handleRequest(event.request))
})

/** 
 * Handles the FetchEvent.
 * @param request The original HTTP request 
 * @return Response The custom HTTP response
 */
async function handleRequest(request) 
{
	//gets the HTTP cookie
	cookie = request.headers.get('Cookie');

	//checks if cookie is unique
	if (!(uniqueUsers.has(cookie)))
	{
		//if unique, generate random seed
		seed = Math.floor(Math.random() * 2);

		//store user and seed into map
		uniqueUsers.set(cookie, seed);
	}
	else
	{
		//if not unique, get seed associated with user
		seed = uniqueUsers.get(cookie);
	}

	//get new response from url
	let session = await fetch(url);
	let sessionText = await session.text();

	//parse JSON response, and randomly select new url using seed
	let variantURL = JSON.parse(sessionText).variants[seed];
	let newSession = await fetch(variantURL);

	//cutomize HTML for each webpage
	const rewriter = new HTMLRewriter()
		.on('title', new AttributeRewriter('', seed))
		.on('h1', new AttributeRewriter('title', seed))
		.on('p', new AttributeRewriter('description', seed))
		.on('a', new AttributeRewriter('url', seed))
	
	//Rewrite HTML and return response
	return rewriter.transform(newSession);
}
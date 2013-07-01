# Inner Cirlce

Everyone should have a circle of trusted friends. Maybe several, for different audiences.

Putting these circles together... you get your **Sphere of Influence**.

## Goals

* Explore private networks
* Kick the tires on Camlistore
* Get an IndieWeb compatible platform
  * POSSE my Twitter

## Use Cases

I write a long blog post.
I address it to my audience, which is a list of contacts.
Any of these people can visit the page, they sign in with Persona.
If the email addresses match, they may read the post.
Anonymous visitors can not read the contents of the post,
but may see some metadata.

I can mention someone in a post, and they will get notified.

I can mention someone's work and they will get a WebMention.

Others can WebMention one of my URIs.
I'll get a notification.

I write a small message and publish it. It syndicates out to Twitter.

I own my own data.

I write something, that I'm not entirely sure about.
I address it to my audience.
They give me private feedback,
by commenting on their own insteance of Enclave.
I can iterate on my original post.

Someone can like my post, I get notified.

It's like writing a letter.

s/Sent from my iPhone/Sent to my Enclave/

## Data Schema

article
  id
  title [id]
  body string
  audiences [list of audience]

audience
  id
  name string
  contacts [list of contact]

contact
  id
  full name string
  addresses [list of address]

address
  id
  protocol [id]
  identifier string

IDS
type:value

Example: address:shout@ozten.com, contact:AustinKing audience:HomebrewClub

Things exist... but you need pages of them for listing as well as search
Pages of ids.

## CSS Framework
Foundation 4.2.3

## TODOs
* Make posts .json file extension
* Style pages
* Add settings panel
  * Make owners
* Allow mentioning people in the main body area
* Quick Contact add with unstructured text
* webmention support
* Email myself on
  * In bound webmention
* Email/SMS/Tweak on
  * Writing new pages
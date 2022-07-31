# Js Modeler
Inspired by pydantic, this is an object class modeler. 
This library holds 2 main things:
- The `createModel` function which takes 2 arguments (listed below) and returns a `Model` class with a structure based on the passed structure
- The `Structs` object with functions that create property structures for creating the desired type and handling of the property

## `createModel` Arguments
  - `model_name: string` which is just the class name per say, errors will show this name
  - `request_structure: ModelRequestStructure` the structure of the generated Model

## ModelRequestStructure
The `ModelRequestStructure` is based on the values from the functions in `Structs` and functions you declare there. This is essentially the shape of the class you want to make and what methods it should have. All functions passed are attached to the generated class's prototype so all class instances will have these functions as "methods"

## Property Structures `Structs`
You can pass an object with the following keys to change behavior of the property strcture to the struct functions:
- `default_value:T` set the default value for the property
- `required:boolean` declare if the property is required to exist among the passed keys when creating a new Model instance
Properties, defaults to true
- `nullable:boolean` declare if this property is allowed to be `null`, defaults to true

The following are the functions for creating property structures
- `string`: create a `string` property, defaults to non-null empty string
- `int`: create a `number` property that also checks if the number is an integer with `Number.isInteger`, defaults to `0`
- `number`: create a `number` property, defaults to non-null `0.0`
- `bool`: create a `boolean` property, defaults to non-null `false`
- `bigint`: create a `BigInt` property, defaults to non-null `BigInt(0)`
- `map`: create a `Map<string, T>` property, defaults to non-null `Map<string, any>`
- `model`: create a `Model` property, defaults to nullable `null`

# Random Example
Just a minor example of what you could do with it though for validating post requests there's better stuff out there if you want a proper robust system
```ts
// Model declaration
const PostRequest = createModel('FormResult', {
  name: Structs.string(),
  // When setting data if in TS pass as the generic whether the property is required or not for proper intellisense, don't know how to handle this properly with typing :(
  email: Structs.string<false>({ required: false }),
  age: Structs.int(),
  type: Structs.string(),
  // For adding methods to the class, just add create the function as if here was the class declaration
  getIntroduction():string {
    return `Hello, my name is ${this.name} and I'm ${this.age} years old.`
  }
});

// Theoretical post request
app.post('/post', (req, res) => {
  let posted:PostRequest;
  try {
    posted = new PostRequest(req.body);
  } catch (e) {
    // Response sents how the sent body differs from the required params
    res.send(e.message);
    return;
  }
  /*
    Use posted data for something
  */
  res.send(posted.getIntroduction());
});
```

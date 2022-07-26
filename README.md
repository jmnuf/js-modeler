# Js Modeler
A project inspired by pydantic. Not meant as a fully optimal or proper.

Though it's inspired by pydantic, it's not meant to emulate it exactly.


```js
// Model declaration
const PostRequest = createModel('FormResult', {
  name: Structs.string(),
  email: Structs.string({ required: false }),
  age: Structs.int(),
  type: Structs.string(),
});

// Theoretical post request
app.post('/post', (req, res) => {
  try {
    const posted = new PostRequest(req.body);
    /*
      Use posted data for something
    */
    res.send('Live a beautiful life ' + posted.name);
  } catch (e) {
    // Response sents how the sent body differs from the required params
    res.send(e.message);
  }
});
```

### Using circDraw.js in your own website.

Add Dependency

- Snap.svg
- jQuery

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.3.1/jquery.min.js" type="text/javascript"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/snap.svg/0.5.1/snap.svg-min.js" type="text/javascript"></script>
<script src="/file path to/circDraw.js" type="text/javascript"></script>
```



**HTML**

```html
<div id="circdraw"></div>
```

**JS**

When adding modifications data, the types must be match will the followng name

- m6A, m1C, m5C, RBP, ORF
- Other will be ignored

```javascript
let exonArray = [
  {"start": 200,"end": 250,"color": 'red',"name": "milk","mod":[
    {"type": "m6A","start": 220,"end": 221},
    {"type": "m1C","start": 231,"end": 232},
    {"type": "m5C","start": 243,"end": 244},]
   },
  {"start": 270,"end": 330,"name": "JACKLI","color": 'yellow',"mod": [
    {"type": "RBP","start": 278,"end": 298},
    {"type": "ORF","start": 290,"end": 315}]
   },
    {"start": 360,"end": 400,"color": 'green',"name": "super","mod": []
    }
]

let circArray = [
  {"start": 200,"end": 330},
  {"start": 270,"end": 400},
  {"start": 360,"end": 400}
]

// Draw a plot
$('#circdraw').circDraw(exonArray, circArray)

// Clear everything
$('#circdraw').circDraw().clear()
```




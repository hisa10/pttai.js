import uuidv4 from 'uuid/v4'
import Immutable from 'immutable'
import camelCase from 'camelcase'
import decamelize from 'decamelize'
import QueryString from 'query-string'
import moment from 'moment'
import createDOMPurify from 'dompurify'
import { JSDOM } from 'jsdom'
import * as constants from '../constants/Constants'


const GLOBAL_IDS = new Set()

const window = (new JSDOM('')).window;
const DOMPurify = createDOMPurify(window);

export const sanitizeHtml = (dirtyHtml) => {
  return DOMPurify.sanitize(dirtyHtml);
}

export const array2Html = (array) => {

  return array.reduce((acc, each, index) => {

    if (each.type === 'attachment') {

      const fileInfo = {
          fileId:     each.param.id,
          fileClass:  each.param.class,
          fileName:   each.param.name,
          fileSize:   each.param.size,
          fileType:   each.param.type,
      }

      const attachmentTemplate = `<div class="${fileInfo.fileClass}" style="display: flex; flex-direction: row; font-family: sans-serif; width: calc(100% - 16px); padding: 8px; border: solid 1px #bbbbbb; border-radius: 12px; margin: auto 0px; cursor: pointer;">
                                    <div class="attachment-icon" style="background-image: url(/images/icon_attach@2x.png); background-repeat: no-repeat; background-size: 50px; width: 50px; min-height:50px; min-width:50px; margin-right: 10px;">
                                    </div>
                                    <div class="attachment-meta" style="display: flex; flex-direction: column; width: calc(100% - 50px); ">
                                      <div class="attachment-title" title="${fileInfo.fileName}" style="padding:2px 5px; height: 20px; line-height: 24px; font-size: 16px; color: #484848; text-overflow: ellipsis; white-space: nowrap; overflow: hidden;">
                                        ${fileInfo.fileName}
                                      </div>
                                      <div class="attachment-size" style="padding:2px 5px; height: 20px; line-height: 24px; font-size: 13px; color: #b1b1b1;">
                                        ${bytesToSize(fileInfo.fileSize)}
                                      </div>
                                    </div>
                                  </div>`;

      let iframe = document.createElement('iframe');
      iframe.className = constants.IFRAME_CLASS_NAME
      iframe.srcdoc = attachmentTemplate
      iframe.frameborder = 0
      iframe.allowfullscreen = true
      iframe.width = '100%'
      iframe.height = '84px'
      iframe.setAttribute('style', 'border-width: 0px')
      iframe.setAttribute('data-id', fileInfo.fileId)
      iframe.setAttribute('data-class', fileInfo.fileClass)
      iframe.setAttribute('data-name', fileInfo.fileName)
      iframe.setAttribute('data-size', fileInfo.fileSize)
      iframe.setAttribute('data-type', fileInfo.fileType)

      return acc + iframe.outerHTML.replace(/\s\s+/g, ' ')
    } else {
      return acc + sanitizeHtml(each.content)
    }
  }, '')
}

export const getUUID = (isCheck=true) => {
  let theID = ''
  while(true) {
    theID = uuidv4()
    if(!isCheck) break

    if(GLOBAL_IDS.has(theID))
      continue

    GLOBAL_IDS.add(theID)
    break

  }
  return theID
}

export const isUUID = (val) => typeof val === 'string' && val.length === 36

export const delay = (milliseconds) => new Promise(() => {
  setTimeout(() => {Promise.resolve()}, milliseconds)
})

export const delayFunc = (func, params, milliseconds=200) => setTimeout(() => {func(...params)}, milliseconds)

export const queryToString = (query) => {
  if(!query) return ''

  return Object.keys(query).reduce((acc, cur) => {
    if (!query[cur]) return acc
    return acc += `${cur}=${query[cur]}&`
  }, '')
}

export const parseQueryString = (str) => QueryString.parse(str)

export const getRoot = (state) => {
  const {app} = state

  let rootId = app.get('rootId', '')
  let rootClass = app.get('rootClass', '')
  let camelCasedClass = toCamelCase(rootClass)

  if(!state[camelCasedClass]) return Immutable.Map()

  return state[camelCasedClass].get(rootId, Immutable.Map())
}

export const getStateChild = (state, child) => {
  return state[child]
}

export const getRootId = (state) => {
  const {app} = state
  if(!app) return ''
  return app.get('rootId', '')
}

export const getSingleChild = (state, childName) => {
  const child = state[childName]
  const ids = child.getIn(['ids', 0], '')
  return child.get(ids, Immutable.Map())
}

export const getChildId = (me, child) => me.getIn(['children', child, 0], '')

export const getChildIds = (me, child) => me.getIn(['children', child], Immutable.List())

export const toCamelCase = (str) => camelCase(str)

export const toUnderscore = (str) => decamelize(str)

export const encodeURIObj = (data) => {
  return Object.keys(data).reduce((r, eachIdx, i) => {
    let v = data[eachIdx]
    if(typeof data[eachIdx] === "string" && !eachIdx.endsWith('ID')) {
      v = encodeURIComponent(data[eachIdx])
    }
    r[eachIdx] = v
    return r
  }, {})
}

export const decodeURIObj = (data) => {
  return Object.keys(data).reduce((r, eachIdx, i) => {
    let v = data[eachIdx]
    if(typeof data[eachIdx] === "string" && !eachIdx.endsWith('ID')) {
      v = decodeURIComponent(data[eachIdx])
    }
    r[eachIdx] = v
    return r
  }, {})
}

export const isUnRead = (updateTS, lastSeen) => {
  if (moment.unix(updateTS).isAfter(moment.unix(lastSeen))) {
    return true
  }
  return false
}

export const dataURLtoFile = (dataurl, filename) => {
    let arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);

    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], filename, {type:mime});
}

export const bytesToSize = (bytes) => {
   let sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

   if (bytes === 0) return '0 Byte';

   let i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)), 10);

   return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
}

export const isWhitespace = (ch) => {
  let whiteSpace = false
  if ((ch === ' ') || (ch === '\t') || (ch === '\n')) {
    whiteSpace = true;
  }
  return whiteSpace;
}

export const getOrientation = (file, callback) => {
  let reader = new FileReader();

  reader.onload = function(e) {

    let view = new DataView(e.target.result);
    if (view.getUint16(0, false) !== 0xFFD8) return callback(-2);
    let length = view.byteLength, offset = 2;

    while (offset < length) {
      let marker = view.getUint16(offset, false);
      offset += 2;
      if (marker === 0xFFE1) {
        if (view.getUint32(offset += 2, false) !== 0x45786966) return callback(-1);
        let little = view.getUint16(offset += 6, false) === 0x4949;
        offset += view.getUint32(offset + 4, little);
        let tags = view.getUint16(offset, little);
        offset += 2;
        for (let i = 0; i < tags; i++)
          if (view.getUint16(offset + (i * 12), little) === 0x0112)
            return callback(view.getUint16(offset + (i * 12) + 8, little));
      }
      else if ((marker & 0xFF00) !== 0xFF00) break;
      else offset += view.getUint16(offset, false);
    }
    return callback(-1);
  };

  reader.readAsArrayBuffer(file);
}

export const newCanvasSize = (w, h, rotation) => {

    /* normalize image size by rotation */
    let rads = rotation * Math.PI / 180;

    let c = Math.cos(rads);
    let s = Math.sin(rads);

    if (s < 0) {
        s = -s;
    }
    if (c < 0) {
        c = -c;
    }

    return [h * s + w * c, h * c + w * s];
}

export const getStatusClass = (status) => {

  let statusClass = 'pre-alive'

  if (status !== 0 && !status) {
    /* null or undefined */
    return 'invalid'
  }

  if (status > 23 || status < 0 || !Number.isInteger(status)) {
    /* invalid */
    return 'invalid'
  }

  if (status >= 0 && status < 7) {
    statusClass = 'pre-alive'
  } else if (status === 7) {
    statusClass = 'alive'
  } else if (status === 8) {
    statusClass = 'failed'
  } else {
    statusClass = 'post-failed'
  }
  return statusClass
}

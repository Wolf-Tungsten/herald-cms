import axios from 'axios'
class ImageUploadAdapter {
    constructor( loader ) {
        this.loader = loader;
        const CancelToken = axios.CancelToken;
        this.axiosSource = CancelToken.source();
    }

    async upload() {
        let file = await this.loader.file
        let form = new FormData()
        form.append('articleId', window.$store.state.currentArticleId)
        form.append('file', file)
        let res = await window.$axios.post('/upload/img',form,{
            cancelToken:this.axiosSource.token,
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })

        return {
            default:res.data.result
        }
    }

    abort(){
        this.axiosSource.cancel()
    }
}

export default function ImageUploadAdapterPlugin( editor ) {
    editor.plugins.get( 'FileRepository' ).createUploadAdapter = ( loader ) => {
        // Configure the URL to the upload script in your back-end here!
        return new ImageUploadAdapter( loader );
    };
}
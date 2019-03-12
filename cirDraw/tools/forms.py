from django import forms
import json

class UploadFileForm(forms.Form):
    parameters = forms.CharField()
    file = forms.FileField()


class JsonTestFile(forms.Form):
    json_receive = forms.CharField()
    print("origin: ", json_receive)

    # def clean(self):
    #     data = self.cleaned_data['json_receive']
    #     print("")
    #     print("data string: ", data.get('file', default="NOTHING"))
    #     print("data json: ", json.loads(data))

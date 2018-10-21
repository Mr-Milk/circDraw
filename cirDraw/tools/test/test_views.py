from django.test import TestCase
from django.urls import reverse
import tools.views as views
# Create your tests here.

"""
What test we want to create here?
test_render_upload_page
test_upload_success
test_process_file
test_save_ok
test_return_uuid
test_redirect_and_render
test_handle_file1
test_handle_file2
test_handle_file3
test_handle_file4
test_handle_file5
"""

class UploadandsaveTest(TestCase):
    @classmethod
    def test_save(self):
        header = ["circRNA_ID", "chr_ci", "circRNA_start", "circRNA_end"]
        results = [{'chr_ci': 'KI270792.1','circRNA_ID': 'KI270792.1:75980|83617','circRNA_end': '83617','circRNA_start': '75980'}]

    def test_render_upload_page(self):
        """name 'tools' for upload home page"""
        response = self.client.get(reverse('tools'))
        self.assertEqual(response.status_code, 200)

    def test_upload_action(self):
        """test upload url is directed correctly"""
        self.assertEqual(reverse('upload&save'),'/tools/submit/')
    def test_upload_success(self):
        """assure that file is uploaded"""
        filename = 'EV71RD_3h'
        with open(filename) as fp:
            response = self.client.post(reverse('upload&save'), {'name': filename, 'file': fp})
        self.assertEqual(response.status_code, 200)
    #test_process_file
    #test_save_ok
    #test_return_uuid
    #test_redirect_and_render
    #test_handle_file1
    #test_handle_file2
    #test_handle_file3
    #test_handle_file4
    #test_handle_file5

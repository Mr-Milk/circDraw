import setuptools

with open("README.md", "r") as fh:
    long_description = fh.read()

setuptools.setup(
    name="process_pkg"
    version="0.0.1",
    author="Tianqin Li"
    author_email="jacklitianqin@gmail.com",
    description="A package as process and insertation agent of CircDraw database",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/Mr-Milk/circDraw",
    packages=setuptools.find_packages(),
    classifiers=[
        "Programming Language :: Python :: 3",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
    ],
)
